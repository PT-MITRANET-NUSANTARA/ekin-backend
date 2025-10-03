import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateSkpDto } from './dto/create-skp.dto';
import { UpdateSkpDto } from './dto/update-skp.dto';
import { FilterSkpDto } from './dto/filter-skp.dto';
import { Skp, SkpStatus } from './entities/skp.entity';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import { PerilakuService } from '../perilaku/perilaku.service';
import { UserService } from '../user/user.service';
import { RhkService } from '../rhk/rhk.service';
import { PerjanjianKinerjaService } from '../perjanjian-kinerja/perjanjian-kinerja.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { perilakuTemplate } from '../common/data/perilaku-template';
import { FeedbackPerilaku } from '../feedback-perilaku/entities/feedback-perilaku.entity';
import { FeedbackAspek } from '../feedback-aspek/entities/feedback-aspek.entity';

@Injectable()
export class SkpService {
  constructor(
    @InjectRepository(Skp)
    private skpRepository: Repository<Skp>,
    @InjectRepository(FeedbackPerilaku)
    private feedbackPerilakuRepository: Repository<FeedbackPerilaku>,
    @InjectRepository(FeedbackAspek)
    private feedbackAspekRepository: Repository<FeedbackAspek>,
    private unitKerjaService: UnitKerjaService,
    private perilakuService: PerilakuService,
    private userService: UserService,
    private rhkService: RhkService,
    private perjanjianKinerjaService: PerjanjianKinerjaService,
  ) {}

  async create(
    createSkpDto: CreateSkpDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService

      // Set default status jika tidak ada
      if (!createSkpDto.status) {
        createSkpDto.status = SkpStatus.DRAFT;
      }

      // Ambil data user dari NIP untuk mendapatkan posjab
      const userResponse = await this.userService.findUserByNip(
        createSkpDto.user_id,
        token,
      );

      // Isi posjab dari respons findUserByNip jika berhasil
      if (userResponse.status && userResponse.data) {
        createSkpDto.posjab = [userResponse.data];
        createSkpDto.unit_id = userResponse.data.unor.induk.id_simpeg;
      }

      const unitResponse = await this.unitKerjaService.findById(
        Number(createSkpDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createSkpDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Buat objek data untuk entity Skp
      const skpData: any = {
        ...createSkpDto,
        // Konversi atasan_skp_id tunggal menjadi array jika ada
        atasan_skp_id: createSkpDto.atasan_skp_id
          ? [createSkpDto.atasan_skp_id]
          : null,
      };

      // Simpan data SKP
      const skp = this.skpRepository.create(skpData);
      const savedSkp = await this.skpRepository.save(skp);

      // Pastikan savedSkp adalah objek tunggal, bukan array
      const skpEntity = Array.isArray(savedSkp) ? savedSkp[0] : savedSkp;

      // Buat perilaku dari template untuk SKP yang baru dibuat
      await this.createPerilakuFromTemplate(skpEntity.id, token);

      // Ambil data SKP yang baru disimpan beserta unit kerja
      const newSkp = await this.skpRepository.findOne({
        where: { id: skpEntity.id },
      });

      // Tambahkan informasi unit kerja
      const skpWithUnit = {
        ...newSkp,
        unit: unitResponse.data,
      };

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'SKP berhasil dibuat',
        data: skpWithUnit,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * Membuat perilaku dari template untuk SKP yang baru dibuat
   * @param skpId ID SKP yang baru dibuat
   * @param token Token otorisasi
   */
  private async createPerilakuFromTemplate(
    skpId: string,
    token: string,
  ): Promise<void> {
    try {
      // Iterasi setiap template perilaku dan buat entri perilaku baru
      for (const template of perilakuTemplate) {
        await this.perilakuService.create(
          {
            skp_id: skpId,
            name: template.name,
            content: template.isi,
            ekspetasi: template.espektasi || '',
          },
          token,
        );
      }
    } catch (error) {
      console.error(`Gagal membuat perilaku dari template: ${error.message}`);
      // Tidak throw error agar proses pembuatan SKP tetap berlanjut
    }
  }

  async findAll(
    filterSkpDto: FilterSkpDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        user_id,
        unit_id,
        renstra_id,
        status,
        pendekatan,
      } = filterSkpDto;

      // Buat query builder
      const queryBuilder = this.skpRepository.createQueryBuilder('skp');

      // Tambahkan filter jika ada
      if (user_id) {
        queryBuilder.andWhere('skp.user_id = :user_id', { user_id });
      }

      if (unit_id) {
        queryBuilder.andWhere('skp.unit_id = :unit_id', { unit_id });
      }

      if (renstra_id) {
        queryBuilder.andWhere('skp.renstra_id = :renstra_id', { renstra_id });
      }

      if (status) {
        queryBuilder.andWhere('skp.status = :status', { status });
      }

      if (pendekatan) {
        queryBuilder.andWhere('skp.pendekatan = :pendekatan', { pendekatan });
      }

      // Hitung total data
      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;

      // Tambahkan pagination
      queryBuilder.skip(offset).take(perPage).orderBy('skp.created_at', 'DESC');

      // Ambil data
      const skpList = await queryBuilder.getMany();

      // Tambahkan informasi unit kerja untuk setiap SKP dan populate SKP atasan jika ada
      const skpWithUnitPromises = skpList.map(async (skp) => {
        const unitResponse = await this.unitKerjaService.findById(
          Number(skp.unit_id),
          token,
        );

        // Populate SKP atasan jika atasan_skp_id tidak null
        let atasanSkp: any = null;
        if (skp.atasan_skp_id && skp.atasan_skp_id.length > 0) {
          // Populate semua SKP atasan dalam array
          const atasanSkpPromises = skp.atasan_skp_id.map(
            async (atasanSkpId) => {
              const atasanSkpData = await this.skpRepository.findOne({
                where: { id: atasanSkpId },
              });

              if (atasanSkpData) {
                const atasanUnitResponse = await this.unitKerjaService.findById(
                  Number(atasanSkpData.unit_id),
                  token,
                );

                return {
                  ...atasanSkpData,
                  unit: atasanUnitResponse.status
                    ? atasanUnitResponse.data
                    : null,
                };
              }
              return null;
            },
          );

          // Filter out null values
          const atasanSkpResults = await Promise.all(atasanSkpPromises);
          atasanSkp = atasanSkpResults.filter((item) => item !== null);
        }

        // Ambil data perjanjian kinerja berdasarkan skp_id
        const perjanjianKinerjaResponse =
          await this.perjanjianKinerjaService.findBySkpId(skp.id, token);
        const perjanjianKinerjaData = perjanjianKinerjaResponse.status
          ? perjanjianKinerjaResponse.data
          : [];

        return {
          ...skp,
          unit_id: unitResponse.status ? unitResponse.data : null,
          atasan_skp_id: atasanSkp,
          perjanjian_kinerja: perjanjianKinerjaData,
        };
      });

      const skpWithUnit = await Promise.all(skpWithUnitPromises);

      // Buat pagination meta
      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total: total,
        last_page: totalPages,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar SKP berhasil diambil',
        data: skpWithUnit,
        pagination,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }

  async findOneWithPenilaian(
    id: string,
    penilaianId: string,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const skp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!skp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Ambil informasi unit kerja
      const unitResponse = await this.unitKerjaService.findById(
        Number(skp.unit_id),
        token,
      );

      // Populate SKP atasan jika atasan_skp_id tidak null
      let atasanSkp: any = null;
      if (skp.atasan_skp_id && skp.atasan_skp_id.length > 0) {
        // Populate semua SKP atasan dalam array
        const atasanSkpPromises = skp.atasan_skp_id.map(async (atasanSkpId) => {
          const atasanSkpData = await this.skpRepository.findOne({
            where: { id: atasanSkpId },
          });

          if (atasanSkpData) {
            const atasanUnitResponse = await this.unitKerjaService.findById(
              Number(atasanSkpData.unit_id),
              token,
            );

            return {
              ...atasanSkpData,
              unit: atasanUnitResponse.status ? atasanUnitResponse.data : null,
            };
          }
          return null;
        });

        // Filter out null values
        const atasanSkpResults = await Promise.all(atasanSkpPromises);
        atasanSkp = atasanSkpResults.filter((item) => item !== null);
      }

      // Ambil data perilaku berdasarkan skp_id
      const perilakuResponse = await this.perilakuService.findBySkpId(
        id,
        token,
      );
      const perilakuData = perilakuResponse.status ? perilakuResponse.data : [];

      // Ambil data RHK berdasarkan skp_id dan periode_penilaian_id
      const rhkResponse = await this.rhkService.findBySkpIdAndPeriodePenilaian(
        id,
        penilaianId,
        token,
      );
      let rhkData = rhkResponse.status ? rhkResponse.data : [];

      // Ambil data feedback aspek untuk setiap aspek di RHK
      if (rhkData && rhkData.length > 0) {
        rhkData = await Promise.all(
          rhkData.map(async (rhk) => {
            if (rhk.aspek && rhk.aspek.length > 0) {
              const aspekWithFeedback = await Promise.all(
                rhk.aspek.map(async (aspek) => {
                  try {
                    // Cari feedback aspek berdasarkan aspek_id dan periode_penilaian_id
                    const feedbackAspek = await this.feedbackAspekRepository
                      .createQueryBuilder('feedback')
                      .where('feedback.aspek_id = :aspek_id', {
                        aspek_id: aspek.id,
                      })
                      .andWhere(
                        'feedback.periode_penilaian_id = :periode_penilaian_id',
                        {
                          periode_penilaian_id: penilaianId,
                        },
                      )
                      .getOne();

                    // Tambahkan feedback_aspek sebagai objek tunggal atau null
                    return {
                      ...aspek,
                      feedback_aspek: feedbackAspek || null,
                    };
                  } catch (error) {
                    console.error(
                      `Error getting feedback for aspek ${aspek.id}:`,
                      error,
                    );
                    return {
                      ...aspek,
                      feedback_aspek: null,
                    };
                  }
                }),
              );
              return {
                ...rhk,
                aspek: aspekWithFeedback,
              };
            }
            return rhk;
          }),
        );
      }

      const skpWithUnit = {
        ...skp,
        unit: unitResponse.status ? unitResponse.data : null,
        atasan_skp: atasanSkp,
        perilaku_id: perilakuData,
        rhk: rhkData, // Menambahkan data RHK berdasarkan periode penilaian ke respons
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Data SKP dengan penilaian berhasil diambil',
        data: skpWithUnit,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }

  async findOneWithPenilaianNilai(
    id: string,
    penilaianId: string,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const skp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!skp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Ambil informasi unit kerja
      const unitResponse = await this.unitKerjaService.findById(
        Number(skp.unit_id),
        token,
      );

      // Populate SKP atasan jika atasan_skp_id tidak null
      let atasanSkp: any = null;
      if (skp.atasan_skp_id && skp.atasan_skp_id.length > 0) {
        // Populate semua SKP atasan dalam array
        const atasanSkpPromises = skp.atasan_skp_id.map(async (atasanSkpId) => {
          const atasanSkpData = await this.skpRepository.findOne({
            where: { id: atasanSkpId },
          });

          if (atasanSkpData) {
            const atasanUnitResponse = await this.unitKerjaService.findById(
              Number(atasanSkpData.unit_id),
              token,
            );

            return {
              ...atasanSkpData,
              unit: atasanUnitResponse.status ? atasanUnitResponse.data : null,
            };
          }
          return null;
        });

        // Filter out null values
        const atasanSkpResults = await Promise.all(atasanSkpPromises);
        atasanSkp = atasanSkpResults.filter((item) => item !== null);
      }

      // Ambil data perilaku berdasarkan skp_id
      const perilakuResponse = await this.perilakuService.findBySkpId(
        id,
        token,
      );
      let perilakuData = perilakuResponse.status ? perilakuResponse.data : [];

      // Ambil data RHK berdasarkan skp_id dan periode_penilaian_id
      const rhkResponse = await this.rhkService.findBySkpIdAndPeriodePenilaian(
        id,
        penilaianId,
        token,
      );
      const rhkData = rhkResponse.status ? rhkResponse.data : [];

      // Ambil data feedback perilaku untuk setiap perilaku
      if (perilakuData && perilakuData.length > 0) {
        // Modifikasi data perilaku untuk menambahkan feedback_perilaku sebagai objek tunggal
        perilakuData = await Promise.all(
          perilakuData.map(async (perilaku) => {
            try {
              // Cari feedback perilaku berdasarkan perilaku_id dan periode_penilaian_id
              const feedbackQuery = await this.feedbackPerilakuRepository
                .createQueryBuilder('feedback')
                .where('feedback.perilaku_id = :perilaku_id', {
                  perilaku_id: perilaku.id,
                })
                .andWhere(
                  'feedback.periode_penilaian_id = :periode_penilaian_id',
                  {
                    periode_penilaian_id: penilaianId,
                  },
                )
                .getOne();

              // Tambahkan feedback_perilaku sebagai objek tunggal atau null
              return {
                ...perilaku,
                feedback_perilaku: feedbackQuery || null,
              };
            } catch (error) {
              console.error(
                `Error getting feedback for perilaku ${perilaku.id}:`,
                error,
              );
              return {
                ...perilaku,
                feedback_perilaku: null,
              };
            }
          }),
        );
      }

      const skpWithUnit = {
        ...skp,
        unit: unitResponse.status ? unitResponse.data : null,
        atasan_skp: atasanSkp,
        perilaku_id: perilakuData,
        rhk: rhkData,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message:
          'Data SKP dengan penilaian dan feedback perilaku berhasil diambil',
        data: skpWithUnit,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const skp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!skp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Ambil informasi unit kerja
      const unitResponse = await this.unitKerjaService.findById(
        Number(skp.unit_id),
        token,
      );

      // Populate SKP atasan jika atasan_skp_id tidak null
      let atasanSkp: any = null;
      if (skp.atasan_skp_id && skp.atasan_skp_id.length > 0) {
        // Populate semua SKP atasan dalam array
        const atasanSkpPromises = skp.atasan_skp_id.map(async (atasanSkpId) => {
          const atasanSkpData = await this.skpRepository.findOne({
            where: { id: atasanSkpId },
          });

          if (atasanSkpData) {
            const atasanUnitResponse = await this.unitKerjaService.findById(
              Number(atasanSkpData.unit_id),
              token,
            );

            return {
              ...atasanSkpData,
              unit: atasanUnitResponse.status ? atasanUnitResponse.data : null,
            };
          }
          return null;
        });

        // Filter out null values
        const atasanSkpResults = await Promise.all(atasanSkpPromises);
        atasanSkp = atasanSkpResults.filter((item) => item !== null);
      }

      // Ambil data perilaku berdasarkan skp_id
      const perilakuResponse = await this.perilakuService.findBySkpId(
        id,
        token,
      );
      const perilakuData = perilakuResponse.status ? perilakuResponse.data : [];

      // Ambil data RHK berdasarkan skp_id
      const rhkResponse = await this.rhkService.findBySkpId(id, token);
      const rhkData = rhkResponse.status ? rhkResponse.data : [];

      const skpWithUnit = {
        ...skp,
        unit: unitResponse.status ? unitResponse.data : null,
        atasan_skp: atasanSkp,
        perilaku_id: perilakuData,
        rhk: rhkData, // Menambahkan data RHK ke respons
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'SKP berhasil diambil',
        data: skpWithUnit,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }

  async getMatriks(
    id: string,
    token: string,
    skpId?: string,
    rhkId?: string,
  ): Promise<ApiResponse> {
    try {
      // Gunakan findOne untuk mendapatkan data SKP dasar
      const skpResponse = await this.findOne(id, token);

      if (!skpResponse.status) {
        return skpResponse; // Return error response jika SKP tidak ditemukan
      }

      const skpData = skpResponse.data;

      // Ambil data RHK berdasarkan skp_id
      const rhkResponse = await this.rhkService.findBySkpId(id, token, rhkId);

      if (!rhkResponse.status || !rhkResponse.data) {
        // Jika tidak ada RHK, kembalikan data SKP tanpa perubahan
        return skpResponse;
      }

      const rhkList = rhkResponse.data;

      // Proses setiap RHK untuk mendapatkan child RHK
      const rhkWithChildrenPromises = rhkList.map(async (rhk) => {
        // Ambil child RHK berdasarkan rhk_atasan_id dan filter skp_id jika ada
        const childRhkResponse = await this.rhkService.findByRhkAtasanId(
          rhk.id,
          token,
          skpId,
        );
        const childRhkList = childRhkResponse.status
          ? childRhkResponse.data
          : [];

        // Tambahkan child RHK ke RHK induk
        return {
          ...rhk,
          child_rhk: childRhkList,
        };
      });

      // Tunggu semua promise selesai
      const rhkWithChildren = await Promise.all(rhkWithChildrenPromises);

      // Buat objek hasil akhir dengan struktur yang sama seperti findOne
      const result = {
        ...skpData,
        rhk: rhkWithChildren,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Matriks SKP berhasil diambil',
        data: result,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }

  async findByUserId(
    userId: string,
    filterSkpDto: FilterSkpDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        unit_id,
        renstra_id,
        status,
        pendekatan,
      } = filterSkpDto;

      // Buat query builder
      const queryBuilder = this.skpRepository.createQueryBuilder('skp');

      // Filter wajib berdasarkan user_id
      queryBuilder.where('skp.user_id = :user_id', { user_id: userId });

      // Tambahkan filter tambahan jika ada
      if (unit_id) {
        queryBuilder.andWhere('skp.unit_id = :unit_id', { unit_id });
      }

      if (renstra_id) {
        queryBuilder.andWhere('skp.renstra_id = :renstra_id', { renstra_id });
      }

      if (status) {
        queryBuilder.andWhere('skp.status = :status', { status });
      }

      if (pendekatan) {
        queryBuilder.andWhere('skp.pendekatan = :pendekatan', { pendekatan });
      }

      // Hitung total data
      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;

      // Tambahkan pagination dan ordering
      queryBuilder.skip(offset).take(perPage).orderBy('skp.created_at', 'DESC');

      // Ambil data
      const skpList = await queryBuilder.getMany();

      if (skpList.length === 0) {
        return {
          code: HttpStatus.OK,
          status: true,
          message: `Tidak ada SKP yang ditemukan untuk user ID ${userId}`,
          data: [],
          pagination: {
            current_page: Number(page),
            per_page: Number(perPage),
            total: 0,
            last_page: 0,
          },
        };
      }

      // Ambil data unit untuk setiap SKP dan populate SKP atasan
      const skpWithUnitPromises = skpList.map(async (skp) => {
        const unitResponse = await this.unitKerjaService.findById(
          Number(skp.unit_id),
          token,
        );

        // Populate SKP atasan jika atasan_skp_id tidak null
        let atasanSkp: any = null;
        if (skp.atasan_skp_id && skp.atasan_skp_id.length > 0) {
          // Populate semua SKP atasan dalam array
          const atasanSkpPromises = skp.atasan_skp_id.map(
            async (atasanSkpId) => {
              const atasanSkpData = await this.skpRepository.findOne({
                where: { id: atasanSkpId },
              });

              if (atasanSkpData) {
                const atasanUnitResponse = await this.unitKerjaService.findById(
                  Number(atasanSkpData.unit_id),
                  token,
                );

                return {
                  ...atasanSkpData,
                  unit: atasanUnitResponse.status
                    ? atasanUnitResponse.data
                    : null,
                };
              }
              return null;
            },
          );

          // Filter out null values
          const atasanSkpResults = await Promise.all(atasanSkpPromises);
          atasanSkp = atasanSkpResults.filter((item) => item !== null);
        }

        const perjanjianKinerjaResponse =
          await this.perjanjianKinerjaService.findBySkpId(skp.id, token);
        const perjanjianKinerjaData = perjanjianKinerjaResponse.status
          ? perjanjianKinerjaResponse.data
          : [];

        return {
          ...skp,
          unit_id: unitResponse.status ? unitResponse.data : null,
          atasan_skp_id: atasanSkp,
          perjanjian_kinerja: perjanjianKinerjaData,
        };
      });

      const skpWithUnit = await Promise.all(skpWithUnitPromises);

      // Buat pagination meta
      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total: total,
        last_page: totalPages,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar SKP berhasil ditemukan',
        data: skpWithUnit,
        pagination,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan saat mencari SKP berdasarkan user ID: ${error.message}`,
        data: null,
      };
    }
  }

  async findByAtasanSkpId(
    atasanSkpId: string,
    filterSkpDto: FilterSkpDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        unit_id,
        renstra_id,
        status,
        pendekatan,
      } = filterSkpDto;

      // Cari SKP yang memiliki atasan_skp_id yang mengandung atasanSkpId
      const queryBuilder = this.skpRepository.createQueryBuilder('skp');

      // Gunakan operator LIKE untuk mencari dalam array JSON
      queryBuilder.where(`skp.atasan_skp_id::text LIKE :atasanSkpId`, {
        atasanSkpId: `%${atasanSkpId}%`,
      });

      // Tambahkan filter tambahan jika ada
      if (unit_id) {
        queryBuilder.andWhere('skp.unit_id = :unit_id', { unit_id });
      }

      if (renstra_id) {
        queryBuilder.andWhere('skp.renstra_id = :renstra_id', { renstra_id });
      }

      if (status) {
        queryBuilder.andWhere('skp.status = :status', { status });
      }

      if (pendekatan) {
        queryBuilder.andWhere('skp.pendekatan = :pendekatan', { pendekatan });
      }

      // Hitung total data
      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;

      // Tambahkan pagination dan ordering
      queryBuilder.skip(offset).take(perPage).orderBy('skp.created_at', 'DESC');

      // Ambil data
      const skpList = await queryBuilder.getMany();

      if (skpList.length === 0) {
        return {
          code: HttpStatus.OK,
          status: true,
          message: `Tidak ada SKP yang ditemukan untuk atasan SKP ID ${atasanSkpId}`,
          data: [],
          pagination: {
            current_page: Number(page),
            per_page: Number(perPage),
            total: 0,
            last_page: 0,
          },
        };
      }

      // Ambil data unit untuk setiap SKP dan populate SKP atasan
      const skpWithUnitPromises = skpList.map(async (skp) => {
        const unitResponse = await this.unitKerjaService.findById(
          Number(skp.unit_id),
          token,
        );

        // Populate SKP atasan jika atasan_skp_id tidak null
        let atasanSkp: any = null;
        if (skp.atasan_skp_id && skp.atasan_skp_id.length > 0) {
          // Populate semua SKP atasan dalam array
          const atasanSkpPromises = skp.atasan_skp_id.map(
            async (atasanSkpId) => {
              const atasanSkpData = await this.skpRepository.findOne({
                where: { id: atasanSkpId },
              });

              if (atasanSkpData) {
                const atasanUnitResponse = await this.unitKerjaService.findById(
                  Number(atasanSkpData.unit_id),
                  token,
                );

                return {
                  ...atasanSkpData,
                  unit: atasanUnitResponse.status
                    ? atasanUnitResponse.data
                    : null,
                };
              }
              return null;
            },
          );

          // Filter out null values
          const atasanSkpResults = await Promise.all(atasanSkpPromises);
          atasanSkp = atasanSkpResults.filter((item) => item !== null);
        }

        return {
          ...skp,
          unit_id: unitResponse.status ? unitResponse.data : null,
          atasan_skp_id: atasanSkp,
        };
      });

      const skpWithUnit = await Promise.all(skpWithUnitPromises);

      // Buat pagination meta
      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total: total,
        last_page: totalPages,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar SKP berhasil ditemukan',
        data: skpWithUnit,
        pagination,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan saat mencari SKP berdasarkan atasan SKP ID: ${error.message}`,
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateSkpDto: UpdateSkpDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Cek apakah SKP ada
      const skp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!skp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Jika ada unit_id baru, verifikasi
      if (updateSkpDto.unit_id) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updateSkpDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updateSkpDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Persiapkan data untuk update
      const updateData: any = { ...updateSkpDto };

      // Konversi atasan_skp_id tunggal menjadi array jika ada
      if (updateData.atasan_skp_id) {
        updateData.atasan_skp_id = [updateData.atasan_skp_id];
      }

      // Update SKP
      await this.skpRepository.update(id, updateData);

      // Ambil data SKP yang sudah diupdate
      const updatedSkp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!updatedSkp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan setelah update`,
          data: null,
        };
      }

      // Ambil informasi unit kerja
      const unitResponse = await this.unitKerjaService.findById(
        Number(updatedSkp.unit_id),
        token,
      );

      const skpWithUnit = {
        ...updatedSkp,
        unit_id: unitResponse.status ? unitResponse.data.id : null,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'SKP berhasil diperbarui',
        data: skpWithUnit,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      // Cek apakah SKP ada
      const skp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!skp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Hapus SKP
      await this.skpRepository.remove(skp);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'SKP berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }
}

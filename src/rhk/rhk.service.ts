import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRhkDto } from './dto/create-rhk.dto';
import { UpdateRhkDto } from './dto/update-rhk.dto';
import { FilterRhkDto } from './dto/filter-rhk.dto';
import { Rhk } from './entities/rhk.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { Rkt } from '../rkt/entities/rkt.entity';
import { AspekService } from '../aspek/aspek.service';
import {
  aspekTemplateUtama,
  aspekTemplateTurunan,
} from '../common/data/aspek-template';

@Injectable()
export class RhkService {
  constructor(
    @InjectRepository(Rhk)
    private readonly rhkRepository: Repository<Rhk>,
    private readonly aspekService: AspekService,
  ) {}

  /**
   * Membuat aspek dari template berdasarkan pendekatan SKP (kualitatif/kuantitatif)
   * @param rhkId ID RHK yang baru dibuat
   * @param skpId ID SKP yang terkait dengan RHK
   * @param token Token otorisasi
   */
  private async createAspekFromTemplate(
    rhkId: string,
    skpId: string,
    token: string,
  ): Promise<void> {
    try {
      // Ambil data SKP untuk mengetahui pendekatannya
      const skpQuery = `
        SELECT pendekatan FROM skp 
        WHERE id = '${skpId}'
      `;

      const skpResult = await this.rhkRepository.query(skpQuery);

      if (!skpResult || skpResult.length === 0) {
        console.error(`SKP dengan ID ${skpId} tidak ditemukan`);
        return;
      }

      const pendekatan = skpResult[0].pendekatan;

      // Pilih template berdasarkan pendekatan SKP
      // Jika KUALITATIF gunakan template utama, jika KUANTITATIF gunakan template turunan
      const templateToUse =
        pendekatan === 'KUALITATIF' ? aspekTemplateUtama : aspekTemplateTurunan;

      // Iterasi setiap template aspek dan buat entri aspek baru
      for (const template of templateToUse) {
        await this.aspekService.create({
          rhk_id: rhkId,
          jenis: template.jenis,
          desc: template.desc,
          // Indikator kinerja awalnya kosong, tidak perlu diisi karena optional
        });
      }
    } catch (error) {
      console.error(`Gagal membuat aspek dari template: ${error.message}`);
      // Tidak throw error agar proses pembuatan RHK tetap berlanjut
    }
  }

  async create(
    createRhkDto: CreateRhkDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Ekstrak userId dari token jika diperlukan
      const userId = this.extractUserIdFromToken(token);

      // Buat entity RHK tanpa rkts_id dulu
      const { rkts_id, ...rhkData } = createRhkDto;

      const rhk = this.rhkRepository.create(rhkData);

      // Simpan RHK terlebih dahulu
      const savedRhk = await this.rhkRepository.save(rhk);

      // Jika ada rkts_id, tambahkan relasi
      if (rkts_id && rkts_id.length > 0) {
        // Konversi string[] menjadi Rkt[]
        const rktEntities = rkts_id.map((id) => ({ id }) as Rkt);
        savedRhk.rkts_id = rktEntities;
        // Update dengan relasi
        await this.rhkRepository.save(savedRhk);
      }

      // Buat aspek dari template berdasarkan pendekatan SKP (kualitatif atau kuantitatif)
      if (savedRhk && savedRhk.id && savedRhk.skp_id) {
        await this.createAspekFromTemplate(savedRhk.id, savedRhk.skp_id, token);
      }

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'RHK berhasil dibuat',
        data: savedRhk,
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

  async findAll(filterDto: FilterRhkDto, token: string): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        skp_id,
        jenis,
        rhk_atasan_id,
        klasifikasi,
      } = filterDto;

      const skip = (page - 1) * perPage;

      const queryBuilder = this.rhkRepository
        .createQueryBuilder('rhk')
        .leftJoinAndSelect('rhk.rkts_id', 'rkts');

      if (skp_id) {
        queryBuilder.andWhere('rhk.skp_id = :skp_id', { skp_id });
      }

      if (jenis) {
        queryBuilder.andWhere('rhk.jenis = :jenis', { jenis });
      }

      if (rhk_atasan_id) {
        queryBuilder.andWhere('rhk.rhk_atasan_id = :rhk_atasan_id', {
          rhk_atasan_id,
        });
      }

      if (klasifikasi) {
        queryBuilder.andWhere('rhk.klasifikasi = :klasifikasi', {
          klasifikasi,
        });
      }

      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);

      queryBuilder.orderBy('rhk.id', 'DESC');
      queryBuilder.skip(skip);
      queryBuilder.take(perPage);

      const rhks = await queryBuilder.getMany();

      // Ambil aspek untuk setiap RHK
      const rhksWithAspek = await Promise.all(
        rhks.map(async (rhk) => {
          const aspekQuery = `
            SELECT * FROM aspek 
            WHERE rhk_id = '${rhk.id}'
            ORDER BY created_at DESC
          `;

          const aspek = await this.rhkRepository.query(aspekQuery);

          return {
            ...rhk,
            aspek: aspek || [],
          };
        }),
      );

      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total: total,
        last_page: totalPages,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar RHK berhasil diambil',
        data: rhksWithAspek,
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

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const rhk = await this.rhkRepository.findOne({
        where: { id },
        relations: ['rkts_id'],
      });

      if (!rhk) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `RHK dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Ambil aspek yang terkait dengan RHK ini
      const aspekQuery = `
        SELECT * FROM aspek 
        WHERE rhk_id = '${id}'
        ORDER BY created_at DESC
      `;

      const aspek = await this.rhkRepository.query(aspekQuery);

      // Tambahkan aspek ke data RHK
      const rhkWithAspek = {
        ...rhk,
        aspek: aspek || [],
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RHK berhasil diambil',
        data: rhkWithAspek,
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

  async findBySkpId(
    skpId: string,
    token: string,
    rhkId?: string,
  ): Promise<ApiResponse> {
    try {
      // Buat kondisi where dasar
      const whereCondition: any = { skp_id: skpId };

      // Tambahkan filter rhk_id jika ada
      if (rhkId) {
        whereCondition.id = rhkId;
      }

      const rhks = await this.rhkRepository.find({
        where: whereCondition,
        order: { id: 'DESC' },
        relations: ['rkts_id'],
      });

      // Ambil data SKP
      const skpQuery = `
        SELECT * FROM skp 
        WHERE id = '${skpId}'
      `;
      const skpResult = await this.rhkRepository.query(skpQuery);
      const skp = skpResult.length > 0 ? skpResult[0] : null;

      // Ambil aspek dan indikator kinerja untuk setiap RHK
      const rhksWithAspek = await Promise.all(
        rhks.map(async (rhk) => {
          const aspekQuery = `
            SELECT * FROM aspek 
            WHERE rhk_id = '${rhk.id}'
            ORDER BY created_at DESC
          `;

          const aspek = await this.rhkRepository.query(aspekQuery);

          // Ambil indikator kinerja untuk setiap aspek
          const aspekWithIndikator = await Promise.all(
            aspek.map(async (asp) => {
              if (asp.indikator_kinerja_id) {
                const indikatorQuery = `
                  SELECT * FROM indikator_kinerja 
                  WHERE id = '${asp.indikator_kinerja_id}'
                `;

                const indikatorResult =
                  await this.rhkRepository.query(indikatorQuery);
                const indikator =
                  indikatorResult.length > 0 ? indikatorResult[0] : null;

                return {
                  ...asp,
                  indikator_kinerja: {
                    name: indikator.name,
                    target: indikator.target,
                    satuan: indikator.satuan,
                  },
                };
              }

              return {
                ...asp,
                indikator_kinerja: null,
              };
            }),
          );

          return {
            ...rhk,
            skp: skp,
            aspek: aspekWithIndikator || [],
          };
        }),
      );

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar RHK berdasarkan SKP ID berhasil diambil',
        data: rhksWithAspek,
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

  async findByRhkAtasanId(
    rhkAtasanId: string,
    token: string,
    skpId?: string,
  ): Promise<ApiResponse> {
    try {
      // Buat kondisi where dasar
      const whereCondition: any = { rhk_atasan_id: rhkAtasanId };

      // Tambahkan filter skp_id jika ada
      if (skpId) {
        whereCondition.skp_id = skpId;
      }

      const rhks = await this.rhkRepository.find({
        where: whereCondition,
        order: { id: 'DESC' },
        relations: ['rkts_id'],
      });

      // Ambil aspek dan indikator kinerja untuk setiap RHK
      const rhksWithAspek = await Promise.all(
        rhks.map(async (rhk) => {
          // Ambil data SKP untuk setiap RHK
          const skpQuery = `
            SELECT * FROM skp 
            WHERE id = '${rhk.skp_id}'
          `;
          const skpResult = await this.rhkRepository.query(skpQuery);
          const skp = skpResult.length > 0 ? skpResult[0] : null;

          const aspekQuery = `
            SELECT * FROM aspek 
            WHERE rhk_id = '${rhk.id}'
            ORDER BY created_at DESC
          `;

          const aspek = await this.rhkRepository.query(aspekQuery);

          // Ambil indikator kinerja untuk setiap aspek
          const aspekWithIndikator = await Promise.all(
            aspek.map(async (asp) => {
              if (asp.indikator_kinerja_id) {
                const indikatorQuery = `
                  SELECT * FROM indikator_kinerja 
                  WHERE id = '${asp.indikator_kinerja_id}'
                `;

                const indikatorResult =
                  await this.rhkRepository.query(indikatorQuery);
                const indikator =
                  indikatorResult.length > 0 ? indikatorResult[0] : null;

                return {
                  ...asp,
                  indikator_kinerja: {
                    name: indikator.name,
                    target: indikator.target,
                    satuan: indikator.satuan,
                  },
                };
              }

              return {
                ...asp,
                indikator_kinerja: null,
              };
            }),
          );

          return {
            ...rhk,
            skp: skp,
            aspek: aspekWithIndikator || [],
          };
        }),
      );

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar RHK berdasarkan RHK Atasan ID berhasil diambil',
        data: rhksWithAspek,
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

  async update(
    id: string,
    updateRhkDto: UpdateRhkDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const rhk = await this.rhkRepository.findOne({
        where: { id },
      });

      if (!rhk) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `RHK dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Pisahkan rkts_id dari data lainnya
      const { rkts_id, ...rhkData } = updateRhkDto;

      // Ekstrak userId dari token jika diperlukan
      const userId = this.extractUserIdFromToken(token);

      // Update properti (tanpa rkts_id)
      Object.assign(rhk, rhkData);

      // Simpan perubahan dasar
      let updatedRhk = await this.rhkRepository.save(rhk);

      // Jika ada rkts_id, update relasi
      if (rkts_id && rkts_id.length > 0) {
        // Konversi string[] menjadi Rkt[]
        updatedRhk.rkts_id = rkts_id.map((id) => ({ id }) as Rkt);
        // Update dengan relasi
        updatedRhk = await this.rhkRepository.save(updatedRhk);
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RHK berhasil diperbarui',
        data: updatedRhk,
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

  async findBySkpIdAndPeriodePenilaian(
    skpId: string,
    periodePenilaianId: string,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Pertama, ambil rhk_penilaian berdasarkan skp_id dan periode_penilaian_id
      const rhkPenilaianQuery = `
        SELECT rhk_id FROM rhk_penilaian 
        WHERE skp_id = '${skpId}' AND periode_penilaian_id = '${periodePenilaianId}'
      `;

      const rhkPenilaianResult =
        await this.rhkRepository.query(rhkPenilaianQuery);

      if (!rhkPenilaianResult || rhkPenilaianResult.length === 0) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message:
            'Tidak ada RHK yang ditemukan untuk SKP ID dan periode penilaian yang diberikan',
          data: [],
        };
      }

      // Ambil semua rhk_id yang ada di rhk_penilaian
      const rhkIds = rhkPenilaianResult.map((item) => item.rhk_id);

      // Ambil data RHK berdasarkan rhk_id yang ada di rhk_penilaian
      const rhks = await this.rhkRepository
        .createQueryBuilder('rhk')
        .leftJoinAndSelect('rhk.rkts_id', 'rkts')
        .where('rhk.id IN (:...rhkIds)', { rhkIds })
        .orderBy('rhk.id', 'DESC')
        .getMany();

      // Ambil data SKP
      const skpQuery = `
        SELECT * FROM skp 
        WHERE id = '${skpId}'
      `;
      const skpResult = await this.rhkRepository.query(skpQuery);
      const skp = skpResult.length > 0 ? skpResult[0] : null;

      // Ambil rencana aksi untuk setiap RHK berdasarkan periode penilaian
      const rencanaAksiQuery = `
        SELECT * FROM rencana_aksi 
        WHERE skp_id = '${skpId}' 
        AND periode_penilaian_id = '${periodePenilaianId}'
        AND rhk_id IN (${rhkIds.map((id) => `'${id}'`).join(',')})
      `;
      const rencanaAksiResult =
        await this.rhkRepository.query(rencanaAksiQuery);

      // Ambil aspek dan indikator kinerja untuk setiap RHK
      const rhksWithAspek = await Promise.all(
        rhks.map(async (rhk) => {
          const aspekQuery = `
            SELECT * FROM aspek 
            WHERE rhk_id = '${rhk.id}'
            ORDER BY created_at DESC
          `;

          const aspek = await this.rhkRepository.query(aspekQuery);

          // Ambil indikator kinerja untuk setiap aspek
          const aspekWithIndikator = await Promise.all(
            aspek.map(async (asp) => {
              if (asp.indikator_kinerja_id) {
                const indikatorQuery = `
                  SELECT * FROM indikator_kinerja 
                  WHERE id = '${asp.indikator_kinerja_id}'
                `;

                const indikatorResult =
                  await this.rhkRepository.query(indikatorQuery);
                const indikator =
                  indikatorResult.length > 0 ? indikatorResult[0] : null;

                return {
                  ...asp,
                  indikator_kinerja: {
                    name: indikator.name,
                    target: indikator.target,
                    satuan: indikator.satuan,
                  },
                };
              }

              return {
                ...asp,
                indikator_kinerja: null,
              };
            }),
          );

          // Filter rencana aksi untuk RHK ini
          const rencanaAksi = rencanaAksiResult.filter(
            (ra) => ra.rhk_id === rhk.id,
          );

          return {
            ...rhk,
            skp: skp,
            aspek: aspekWithIndikator || [],
            rencana_aksi: rencanaAksi || [],
          };
        }),
      );

      return {
        code: HttpStatus.OK,
        status: true,
        message:
          'Daftar RHK berdasarkan SKP ID dan periode penilaian berhasil diambil',
        data: rhksWithAspek,
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
      const rhk = await this.rhkRepository.findOne({
        where: { id },
      });

      if (!rhk) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `RHK dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.rhkRepository.remove(rhk);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RHK berhasil dihapus',
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

  // Helper method untuk ekstrak userId dari token
  private extractUserIdFromToken(token: string): string {
    // Implementasi sederhana, bisa disesuaikan dengan kebutuhan
    // Biasanya token diproses oleh JwtAuthGuard dan informasi user tersedia di req.user
    return token.split(' ')[1]?.substring(0, 10) || 'system';
  }

  async findRealisasi(
    id: string,
    periodePenilaianId: string,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Cari RHK berdasarkan ID
      const rhk = await this.rhkRepository.findOne({ where: { id } });
      
      if (!rhk) {
        throw new NotFoundException(`RHK dengan ID ${id} tidak ditemukan`);
      }
      
      // Mengembalikan data realisasi dari RHK
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Data realisasi RHK',
        data: rhk.realisasi || null,
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
  
  async updateRealisasi(
    id: string,
    periodePenilaianId: string,
    realisasi: Record<string, string>[],
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Cari RHK berdasarkan ID
      const rhk = await this.rhkRepository.findOne({ where: { id } });
      
      if (!rhk) {
        throw new NotFoundException(`RHK dengan ID ${id} tidak ditemukan`);
      }
      
      // Update field realisasi
      rhk.realisasi = realisasi;
      
      // Simpan perubahan
      await this.rhkRepository.save(rhk);
      
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Realisasi RHK berhasil diperbarui',
        data: rhk.realisasi,
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

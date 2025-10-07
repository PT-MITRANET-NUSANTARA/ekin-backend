import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVerificatorDto } from './dto/create-verificator.dto';
import { UpdateVerificatorDto } from './dto/update-verificator.dto';
import { FilterVerificatorDto } from './dto/filter-verificator.dto';
import { VerifyUnitJabatanDto } from './dto/verify-unit-jabatan.dto';
import { Verificator } from './entities/verificator.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';

@Injectable()
export class VerificatorService {
  constructor(
    @InjectRepository(Verificator)
    private readonly verificatorRepository: Repository<Verificator>,
    private readonly unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createVerificatorDto: CreateVerificatorDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Validasi unit_id
      const unitKerja = await this.unitKerjaService.findById(
        Number(createVerificatorDto.unit_id),
        token,
      );

      if (!unitKerja.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit kerja dengan ID ${createVerificatorDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Validasi unor_id dalam jabatan
      for (const jabatanItem of createVerificatorDto.jabatan) {
        for (const unorId of Object.keys(jabatanItem)) {
          const unor = await this.unitKerjaService.findById(
            Number(unorId),
            token,
          );
          if (!unor.status) {
            return {
              code: HttpStatus.BAD_REQUEST,
              status: false,
              message: `Unor dengan ID ${unorId} tidak ditemukan`,
              data: null,
            };
          }
        }
      }

      const verificator =
        this.verificatorRepository.create(createVerificatorDto);
      const savedVerificator =
        await this.verificatorRepository.save(verificator);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Verificator berhasil dibuat',
        data: savedVerificator,
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

  async findAll(
    filterDto: FilterVerificatorDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const { page = 1, perPage = 10, unit_id } = filterDto;
      const skip = (page - 1) * perPage;

      const queryBuilder =
        this.verificatorRepository.createQueryBuilder('verificator');

      if (unit_id) {
        queryBuilder.andWhere('verificator.unit_id = :unit_id', { unit_id });
      }

      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);

      queryBuilder.orderBy('verificator.created_at', 'DESC');
      queryBuilder.skip(skip);
      queryBuilder.take(perPage);

      const verificators = await queryBuilder.getMany();

      // Populate unit dan unor data
      const populatedVerificators = await Promise.all(
        verificators.map(async (verificator) => {
          // Fetch unit details
          const unitData = await this.getUnitDetails(
            verificator.unit_id,
            token,
          );

          // Fetch unor details for each jabatan
          const populatedJabatanDetails: Array<{
            unor_id: string;
            unor_detail: any;
            jabatan_list: string[];
          }> = [];

          if (verificator.jabatan && verificator.jabatan.length > 0) {
            for (const jabatanItem of verificator.jabatan) {
              const unorId = Object.keys(jabatanItem)[0];
              if (unorId) {
                const unorDetails = await this.getUnitDetails(unorId, token);
                populatedJabatanDetails.push({
                  unor_id: unorId,
                  unor_detail: unorDetails,
                  jabatan_list: jabatanItem[unorId],
                });
              }
            }
          }

          return {
            ...verificator,
            unit_detail: unitData,
            jabatan_detail: populatedJabatanDetails,
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
        message: 'Daftar verificator berhasil diambil',
        data: populatedVerificators,
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
      const verificator = await this.verificatorRepository.findOne({
        where: { id },
      });

      if (!verificator) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Verificator dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Populate unit dan unor data
      const unitData = await this.getUnitDetails(verificator.unit_id, token);

      // Fetch unor details for each jabatan
      const populatedJabatanDetails: Array<{
        unor_id: string;
        unor_detail: any;
        jabatan_list: string[];
      }> = [];

      if (verificator.jabatan && verificator.jabatan.length > 0) {
        for (const jabatanItem of verificator.jabatan) {
          const unorId = Object.keys(jabatanItem)[0];
          if (unorId) {
            const unorDetails = await this.getUnitDetails(unorId, token);
            populatedJabatanDetails.push({
              unor_id: unorId,
              unor_detail: unorDetails,
              jabatan_list: jabatanItem[unorId],
            });
          }
        }
      }

      const populatedVerificator = {
        ...verificator,
        unit_detail: unitData,
        jabatan_detail: populatedJabatanDetails,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Verificator berhasil diambil',
        data: populatedVerificator,
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
    updateVerificatorDto: UpdateVerificatorDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const verificator = await this.verificatorRepository.findOne({
        where: { id },
      });

      if (!verificator) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Verificator dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Validasi unit_id jika ada
      if (updateVerificatorDto.unit_id) {
        const unitKerja = await this.unitKerjaService.findById(
          Number(updateVerificatorDto.unit_id),
          token,
        );

        if (!unitKerja.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit kerja dengan ID ${updateVerificatorDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Validasi unor_id dalam jabatan jika ada
      if (updateVerificatorDto.jabatan) {
        for (const jabatanItem of updateVerificatorDto.jabatan) {
          for (const unorId of Object.keys(jabatanItem)) {
            const unor = await this.unitKerjaService.findById(
              Number(unorId),
              token,
            );
            if (!unor.status) {
              return {
                code: HttpStatus.BAD_REQUEST,
                status: false,
                message: `Unor dengan ID ${unorId} tidak ditemukan`,
                data: null,
              };
            }
          }
        }
      }

      // Update properti
      Object.assign(verificator, updateVerificatorDto);
      const updatedVerificator =
        await this.verificatorRepository.save(verificator);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Verificator berhasil diperbarui',
        data: updatedVerificator,
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
      const verificator = await this.verificatorRepository.findOne({
        where: { id },
      });

      if (!verificator) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Verificator dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.verificatorRepository.remove(verificator);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Verificator berhasil dihapus',
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

  async verifyUnitAndJabatan(
    verifyDto: VerifyUnitJabatanDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Validasi unit_id
      const unitKerja = await this.unitKerjaService.findById(
        verifyDto.unit_id,
        token,
      );

      if (!unitKerja.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit kerja dengan ID ${verifyDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Cari verificator berdasarkan unit_id
      const verificators = await this.verificatorRepository.find();

      // Hasil verifikasi
      interface VerificationResult {
        verificator: {
          id: string;
          unit_id: string;
        };
        valid_unit_ids: string[];
      }

      const verificationResults: VerificationResult[] = [];

      // Untuk setiap verificator, periksa apakah unit_id dan jabatan cocok
      for (const verificator of verificators) {
        let isUnitMatch = false;
        let validUnitIds: string[] = [];

        // Cek apakah unit_id input sama dengan salah satu key dalam array jabatan input
        for (const jabatanItem of verifyDto.jabatan) {
          const unitIds = Object.keys(jabatanItem);

          // Jika unit_id cocok dengan salah satu key dalam jabatan
          if (unitIds.includes(verifyDto.unit_id.toString())) {
            isUnitMatch = true;

            // Cek apakah verificator memiliki jabatan yang cocok
            for (const verJabatanItem of verificator.jabatan) {
              const verUnitIds = Object.keys(verJabatanItem);

              // Untuk setiap unit ID dalam verificator
              for (const verUnitId of verUnitIds) {
                // Dapatkan daftar jabatan dari input dan verificator untuk unit ID ini
                const inputJabatanList =
                  jabatanItem[verifyDto.unit_id.toString()];
                const verJabatanList = verJabatanItem[verUnitId];

                // Cari jabatan yang cocok
                const hasMatchingJabatan = inputJabatanList.some((inputJab) =>
                  verJabatanList.some(
                    (verJab) => verJab.toLowerCase() === inputJab.toLowerCase(),
                  ),
                );

                // Jika ada jabatan yang cocok, tambahkan unit ID ke daftar valid
                if (hasMatchingJabatan && !validUnitIds.includes(verUnitId)) {
                  validUnitIds.push(verUnitId);
                }
              }
            }

            break;
          }
        }

        // Jika unit cocok dan ada unit ID yang valid, tambahkan ke hasil
        if (isUnitMatch && validUnitIds.length > 0) {
          verificationResults.push({
            verificator: {
              id: verificator.id,
              unit_id: verificator.unit_id,
            },
            valid_unit_ids: validUnitIds,
          });
        }
      }

      if (verificationResults.length === 0) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message:
            'Tidak ditemukan verificator yang sesuai dengan unit dan jabatan yang diberikan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Verificator berhasil ditemukan',
        data: verificationResults,
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
    return token.split(' ')[1]?.substring(0, 10) || 'system';
  }

  // Helper method untuk mendapatkan detail unit
  private async getUnitDetails(unitId: string, token: string): Promise<any> {
    try {
      const unitResponse = await this.unitKerjaService.findById(
        Number(unitId),
        token,
      );
      if (unitResponse.status && unitResponse.data) {
        return unitResponse.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching unit details: ${error.message}`);
      return null;
    }
  }

  // Helper method untuk mendapatkan detail unor
  private async populateUnorDetails(
    jabatan: Array<Record<string, string[]>>,
    token: string,
  ): Promise<any> {
    const populatedJabatanDetails: Array<{
      unor_id: string;
      unor_detail: any;
      jabatan_list: string[];
    }> = [];

    if (jabatan && jabatan.length > 0) {
      for (const jabatanItem of jabatan) {
        for (const unorId of Object.keys(jabatanItem)) {
          if (unorId) {
            const unorDetails = await this.getUnitDetails(unorId, token);
            populatedJabatanDetails.push({
              unor_id: unorId,
              unor_detail: unorDetails,
              jabatan_list: jabatanItem[unorId],
            });
          }
        }
      }
    }

    return populatedJabatanDetails;
  }
}

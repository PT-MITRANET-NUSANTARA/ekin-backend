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
      for (const unorId of Object.keys(createVerificatorDto.jabatan)) {
        const unor = await this.unitKerjaService.findUnorById(
          Number(createVerificatorDto.unit_id),
          unorId,
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
          const populatedJabatan = await this.populateUnorDetails(
            verificator.unit_id,
            verificator.jabatan,
            token,
          );

          return {
            ...verificator,
            unit_detail: unitData,
            jabatan_detail: populatedJabatan,
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
      const populatedJabatan = await this.populateUnorDetails(
        verificator.unit_id,
        verificator.jabatan,
        token,
      );

      const populatedVerificator = {
        ...verificator,
        unit_detail: unitData,
        jabatan_detail: populatedJabatan,
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
        for (const unorId of Object.keys(updateVerificatorDto.jabatan)) {
          const unor = await this.unitKerjaService.findUnorById(
            Number(updateVerificatorDto.unit_id),
            unorId,
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
    unitId: string,
    jabatan: Record<string, string[]>,
    token: string,
  ): Promise<any> {
    try {
      const populatedJabatan = {};

      for (const unorId of Object.keys(jabatan)) {
        const unorResponse = await this.unitKerjaService.findUnorById(
          Number(unitId),
          unorId,
          token,
        );
        if (unorResponse.status && unorResponse.data) {
          populatedJabatan[unorId] = {
            unor_detail: unorResponse.data,
            jabatan_list: jabatan[unorId],
          };
        } else {
          populatedJabatan[unorId] = {
            unor_detail: null,
            jabatan_list: jabatan[unorId],
          };
        }
      }

      return populatedJabatan;
    } catch (error) {
      console.error(`Error populating unor details: ${error.message}`);
      return jabatan;
    }
  }
}

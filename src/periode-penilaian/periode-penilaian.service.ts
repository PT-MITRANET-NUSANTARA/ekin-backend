import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePeriodePenilaianDto } from './dto/create-periode-penilaian.dto';
import { UpdatePeriodePenilaianDto } from './dto/update-periode-penilaian.dto';
import { PeriodePenilaian } from './entities/periode-penilaian.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class PeriodePenilaianService {
  constructor(
    @InjectRepository(PeriodePenilaian)
    private periodePenilaianRepository: Repository<PeriodePenilaian>,
  ) {}

  async create(
    createPeriodePenilaianDto: CreatePeriodePenilaianDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const newPeriodePenilaian = this.periodePenilaianRepository.create(
        createPeriodePenilaianDto,
      );
      const result =
        await this.periodePenilaianRepository.save(newPeriodePenilaian);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Periode penilaian berhasil dibuat',
        data: result,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal membuat periode penilaian',
        data: null,
      };
    }
  }

  async findAll(unitId: string, token: string): Promise<ApiResponse> {
    try {
      let query =
        this.periodePenilaianRepository.createQueryBuilder('periode_penilaian');

      if (unitId) {
        query = query.where('periode_penilaian.unit_id = :unitId', { unitId });
      }

      const periodePenilaian = await query.getMany();

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar periode penilaian berhasil diambil',
        data: periodePenilaian,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil daftar periode penilaian',
        data: null,
      };
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const periodePenilaian = await this.periodePenilaianRepository.findOne({
        where: { id },
      });

      if (!periodePenilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Periode penilaian tidak ditemukan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Periode penilaian berhasil diambil',
        data: periodePenilaian,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil periode penilaian',
        data: null,
      };
    }
  }

  async update(
    id: string,
    updatePeriodePenilaianDto: UpdatePeriodePenilaianDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const periodePenilaian = await this.periodePenilaianRepository.findOne({
        where: { id },
      });

      if (!periodePenilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Periode penilaian tidak ditemukan',
          data: null,
        };
      }

      await this.periodePenilaianRepository.update(
        id,
        updatePeriodePenilaianDto,
      );

      const updatedPeriodePenilaian =
        await this.periodePenilaianRepository.findOne({
          where: { id },
        });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Periode penilaian berhasil diperbarui',
        data: updatedPeriodePenilaian,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal memperbarui periode penilaian',
        data: null,
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const periodePenilaian = await this.periodePenilaianRepository.findOne({
        where: { id },
      });

      if (!periodePenilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Periode penilaian tidak ditemukan',
          data: null,
        };
      }

      await this.periodePenilaianRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Periode penilaian berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal menghapus periode penilaian',
        data: null,
      };
    }
  }
}

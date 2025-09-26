import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRhkPenilaianDto } from './dto/create-rhk-penilaian.dto';
import { UpdateRhkPenilaianDto } from './dto/update-rhk-penilaian.dto';
import { RhkPenilaian } from './entities/rhk-penilaian.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class RhkPenilaianService {
  constructor(
    @InjectRepository(RhkPenilaian)
    private rhkPenilaianRepository: Repository<RhkPenilaian>,
  ) {}

  async create(
    createRhkPenilaianDto: CreateRhkPenilaianDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const newRhkPenilaian = this.rhkPenilaianRepository.create(
        createRhkPenilaianDto,
      );
      const result = await this.rhkPenilaianRepository.save(newRhkPenilaian);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'RHK Penilaian berhasil dibuat',
        data: result,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal membuat RHK Penilaian',
        data: null,
      };
    }
  }

  async findAll(skpId: string, token: string): Promise<ApiResponse> {
    try {
      let query =
        this.rhkPenilaianRepository.createQueryBuilder('rhk_penilaian');

      if (skpId) {
        query = query.where('rhk_penilaian.skp_id = :skpId', { skpId });
      }

      const rhkPenilaian = await query.getMany();

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar RHK Penilaian berhasil diambil',
        data: rhkPenilaian,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil daftar RHK Penilaian',
        data: null,
      };
    }
  }

  async findBySkpId(skpId: string, token: string): Promise<ApiResponse> {
    try {
      if (!skpId) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'SKP ID diperlukan',
          data: null,
        };
      }

      const rhkPenilaian = await this.rhkPenilaianRepository.find({
        where: { skp_id: skpId },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar RHK Penilaian berdasarkan SKP ID berhasil diambil',
        data: rhkPenilaian,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message:
          error.message ||
          'Gagal mengambil daftar RHK Penilaian berdasarkan SKP ID',
        data: null,
      };
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const rhkPenilaian = await this.rhkPenilaianRepository.findOne({
        where: { id },
      });

      if (!rhkPenilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'RHK Penilaian tidak ditemukan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RHK Penilaian berhasil ditemukan',
        data: rhkPenilaian,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal menemukan RHK Penilaian',
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateRhkPenilaianDto: UpdateRhkPenilaianDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const rhkPenilaian = await this.rhkPenilaianRepository.findOne({
        where: { id },
      });

      if (!rhkPenilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'RHK Penilaian tidak ditemukan',
          data: null,
        };
      }

      await this.rhkPenilaianRepository.update(id, updateRhkPenilaianDto);
      const updatedRhkPenilaian = await this.rhkPenilaianRepository.findOne({
        where: { id },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RHK Penilaian berhasil diperbarui',
        data: updatedRhkPenilaian,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal memperbarui RHK Penilaian',
        data: null,
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const rhkPenilaian = await this.rhkPenilaianRepository.findOne({
        where: { id },
      });

      if (!rhkPenilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'RHK Penilaian tidak ditemukan',
          data: null,
        };
      }

      await this.rhkPenilaianRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RHK Penilaian berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal menghapus RHK Penilaian',
        data: null,
      };
    }
  }
}

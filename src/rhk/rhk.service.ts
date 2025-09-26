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

@Injectable()
export class RhkService {
  constructor(
    @InjectRepository(Rhk)
    private readonly rhkRepository: Repository<Rhk>,
  ) {}

  async create(
    createRhkDto: CreateRhkDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Ekstrak userId dari token jika diperlukan
      const userId = this.extractUserIdFromToken(token);

      const rhk = this.rhkRepository.create({
        ...createRhkDto,
        created_by: userId,
      });

      const savedRhk = await this.rhkRepository.save(rhk);

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

      const queryBuilder = this.rhkRepository.createQueryBuilder('rhk');

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
        data: rhks,
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
        where: { id: Number(id) },
      });

      if (!rhk) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `RHK dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RHK berhasil diambil',
        data: rhk,
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

  async findBySkpId(skpId: string, token: string): Promise<ApiResponse> {
    try {
      const rhks = await this.rhkRepository.find({
        where: { skp_id: Number(skpId) },
        order: { id: 'DESC' },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar RHK berdasarkan SKP ID berhasil diambil',
        data: rhks,
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
        where: { id: Number(id) },
      });

      if (!rhk) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `RHK dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Ekstrak userId dari token jika diperlukan
      const userId = this.extractUserIdFromToken(token);

      // Update properti
      Object.assign(rhk, {
        ...updateRhkDto,
        updated_by: userId,
      });

      const updatedRhk = await this.rhkRepository.save(rhk);

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

  async remove(id: string): Promise<ApiResponse> {
    try {
      const rhk = await this.rhkRepository.findOne({
        where: { id: Number(id) },
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
}

import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateVisiDto } from './dto/create-visi.dto';
import { UpdateVisiDto } from './dto/update-visi.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Visi } from './entities/visi.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { FilterVisiDto } from './dto/filter-visi.dto';

@Injectable()
export class VisiService {
  constructor(
    @InjectRepository(Visi)
    private visiRepository: Repository<Visi>,
  ) {}

  async create(createVisiDto: CreateVisiDto): Promise<ApiResponse> {
    try {
      const visi = this.visiRepository.create(createVisiDto);
      const result = await this.visiRepository.save(visi);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Visi berhasil dibuat',
        data: result,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal membuat visi',
        data: null,
      };
    }
  }

  async findAll(filterDto: FilterVisiDto): Promise<ApiResponse> {
    try {
      const { search, page = 1, perPage = 10 } = filterDto;

      // Build query with search filter if provided
      const whereCondition = search
        ? [{ name: Like(`%${search}%`) }, { desc: Like(`%${search}%`) }]
        : {};

      // Calculate skip for pagination
      const skip = (page - 1) * perPage;

      // Get total count for pagination
      const total = await this.visiRepository.count({
        where: whereCondition,
      });

      // Calculate last page
      const lastPage = Math.ceil(total / perPage);

      // Get data with pagination
      const visi = await this.visiRepository.find({
        where: whereCondition,
        skip,
        take: perPage,
        order: { createdAt: 'DESC' },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar visi berhasil diambil',
        data: visi,
        pagination: {
          current_page: page,
          per_page: perPage,
          total,
          last_page: lastPage,
        },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mengambil daftar visi',
        data: null,
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const visi = await this.visiRepository.findOne({ where: { id } });

      if (!visi) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Visi tidak ditemukan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Visi berhasil ditemukan',
        data: visi,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mencari visi',
        data: null,
      };
    }
  }

  async update(id: string, updateVisiDto: UpdateVisiDto): Promise<ApiResponse> {
    try {
      const visi = await this.visiRepository.findOne({ where: { id } });

      if (!visi) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Visi tidak ditemukan',
          data: null,
        };
      }

      await this.visiRepository.update(id, updateVisiDto);
      const updated = await this.visiRepository.findOne({ where: { id } });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Visi berhasil diupdate',
        data: updated,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mengupdate visi',
        data: null,
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const visi = await this.visiRepository.findOne({ where: { id } });

      if (!visi) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Visi tidak ditemukan',
          data: null,
        };
      }

      await this.visiRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Visi berhasil dihapus',
        data: { id },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal menghapus visi',
        data: null,
      };
    }
  }
}

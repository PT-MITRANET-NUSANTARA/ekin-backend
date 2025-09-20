import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateMisiDto } from './dto/create-misi.dto';
import { UpdateMisiDto } from './dto/update-misi.dto';
import { FilterMisiDto } from './dto/filter-misi.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Misi } from './entities/misi.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class MisiService {
  constructor(
    @InjectRepository(Misi)
    private misiRepository: Repository<Misi>,
  ) {}

  async create(createMisiDto: CreateMisiDto): Promise<ApiResponse> {
    try {
      const misi = this.misiRepository.create(createMisiDto);
      const result = await this.misiRepository.save(misi);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Misi berhasil dibuat',
        data: result,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal membuat misi',
        data: null,
      };
    }
  }

  async findAll(filterDto: FilterMisiDto): Promise<ApiResponse> {
    try {
      const { search, page = 1, perPage = 10, visi_id } = filterDto;

      // Build query with search filter if provided
      let whereCondition: any = {};

      if (search) {
        whereCondition = [
          { name: Like(`%${search}%`) },
          { desc: Like(`%${search}%`) },
        ];
      }

      // Filter by visi_id if provided
      if (visi_id) {
        whereCondition = {
          ...whereCondition,
          visi_id,
        };
      }

      // Calculate skip for pagination
      const skip = (page - 1) * perPage;

      // Get total count for pagination
      const total = await this.misiRepository.count({
        where: whereCondition,
      });

      // Calculate last page
      const lastPage = Math.ceil(total / perPage);

      // Get data with pagination
      const misi = await this.misiRepository.find({
        where: whereCondition,
        skip,
        take: perPage,
        order: { createdAt: 'DESC' },
        relations: ['visi'],
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar misi berhasil diambil',
        data: misi,
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
        message: 'Gagal mengambil daftar misi',
        data: null,
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const misi = await this.misiRepository.findOne({
        where: { id },
        relations: ['visi'],
      });

      if (!misi) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Misi tidak ditemukan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Misi berhasil ditemukan',
        data: misi,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mencari misi',
        data: null,
      };
    }
  }

  async update(id: string, updateMisiDto: UpdateMisiDto): Promise<ApiResponse> {
    try {
      const misi = await this.misiRepository.findOne({ where: { id } });

      if (!misi) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Misi tidak ditemukan',
          data: null,
        };
      }

      await this.misiRepository.update(id, updateMisiDto);
      const updatedMisi = await this.misiRepository.findOne({
        where: { id },
        relations: ['visi'],
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Misi berhasil diperbarui',
        data: updatedMisi,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal memperbarui misi',
        data: null,
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const misi = await this.misiRepository.findOne({ where: { id } });

      if (!misi) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Misi tidak ditemukan',
          data: null,
        };
      }

      await this.misiRepository.remove(misi);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Misi berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal menghapus misi',
        data: null,
      };
    }
  }
}

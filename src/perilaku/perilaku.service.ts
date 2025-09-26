import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreatePerilakuDto } from './dto/create-perilaku.dto';
import { UpdatePerilakuDto } from './dto/update-perilaku.dto';
import { FilterPerilakuDto } from './dto/filter-perilaku.dto';
import { Perilaku } from './entities/perilaku.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class PerilakuService {
  constructor(
    @InjectRepository(Perilaku)
    private perilakuRepository: Repository<Perilaku>,
  ) {}

  async create(
    createPerilakuDto: CreatePerilakuDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Buat perilaku baru
      const perilaku = this.perilakuRepository.create({
        skp_id: createPerilakuDto.skp_id,
        name: createPerilakuDto.name,
        content: createPerilakuDto.content,
        ekspetasi: createPerilakuDto.ekspetasi,
      });

      const savedPerilaku = await this.perilakuRepository.save(perilaku);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Perilaku berhasil dibuat',
        data: savedPerilaku,
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
    filterDto: FilterPerilakuDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const { page = 1, perPage = 10, search, skp_id } = filterDto;

      const queryBuilder =
        this.perilakuRepository.createQueryBuilder('perilaku');

      if (search) {
        queryBuilder.andWhere('perilaku.name LIKE :search', {
          search: `%${search}%`,
        });
      }

      if (skp_id) {
        queryBuilder.andWhere('perilaku.skp_id = :skp_id', { skp_id });
      }

      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;

      queryBuilder.skip(offset).take(perPage);
      queryBuilder.orderBy('perilaku.created_at', 'DESC');

      const perilakus = await queryBuilder.getMany();

      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total: total,
        last_page: totalPages,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar Perilaku berhasil diambil',
        data: perilakus,
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
      const perilaku = await this.perilakuRepository.findOne({
        where: { id },
      });

      if (!perilaku) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Perilaku dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Perilaku berhasil diambil',
        data: perilaku,
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
      const perilakus = await this.perilakuRepository.find({
        where: { skp_id: skpId },
        order: { created_at: 'DESC' },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar Perilaku berhasil diambil',
        data: perilakus,
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
    updatePerilakuDto: UpdatePerilakuDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const perilaku = await this.perilakuRepository.findOne({
        where: { id },
      });

      if (!perilaku) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Perilaku dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Update properti
      await this.perilakuRepository.update(id, {
        skp_id: updatePerilakuDto.skp_id,
        name: updatePerilakuDto.name,
        content: updatePerilakuDto.content,
        ekspetasi: updatePerilakuDto.ekspetasi,
      });

      const updatedPerilaku = await this.perilakuRepository.findOne({
        where: { id },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Perilaku berhasil diperbarui',
        data: updatedPerilaku,
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

  async remove(id: string, token: string): Promise<ApiResponse> {
    try {
      const perilaku = await this.perilakuRepository.findOne({
        where: { id },
      });

      if (!perilaku) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Perilaku dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.perilakuRepository.remove(perilaku);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Perilaku berhasil dihapus',
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

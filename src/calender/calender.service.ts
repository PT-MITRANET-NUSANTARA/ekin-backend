import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateCalenderDto } from './dto/create-calender.dto';
import { UpdateCalenderDto } from './dto/update-calender.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Calender } from './entities/calender.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { FilterCalenderDto } from './dto/filter-calender.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class CalenderService {
  constructor(
    @InjectRepository(Calender)
    private calenderRepository: Repository<Calender>,
    private logsService: LogsService,
  ) {}

  async create(
    createCalenderDto: CreateCalenderDto,
    user: any,
  ): Promise<ApiResponse> {
    try {
      const exists = await this.calenderRepository.findOne({
        where: {
          unit_id: createCalenderDto.unit_id,
          date: createCalenderDto.date,
        },
      });
      if (exists) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'Tanggal sudah ada untuk unit ini',
          data: null,
        };
      }
      const cal = this.calenderRepository.create(createCalenderDto);
      const result = await this.calenderRepository.save(cal);
      await this.logsService.logCreate(
        user?.mapData?.nipBaru || 'system',
        'calender',
        result.id,
        `Membuat calender: ${result.date}`,
      );
      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Calender berhasil dibuat',
        data: result,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal membuat calender',
        data: null,
      };
    }
  }

  async findAll(filterDto: FilterCalenderDto): Promise<ApiResponse> {
    try {
      const { search, page = 1, perPage = 10 } = filterDto;
      const where = search
        ? [{ holiday_name: Like(`%${search}%`) }]
        : {};
      const skip = (page - 1) * perPage;
      const total = await this.calenderRepository.count({ where });
      const lastPage = Math.ceil(total / perPage);
      const data = await this.calenderRepository.find({
        where,
        skip,
        take: perPage,
        order: { createdAt: 'DESC' },
      });
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar calender berhasil diambil',
        data,
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
        message: 'Gagal mengambil calender',
        data: null,
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const item = await this.calenderRepository.findOne({ where: { id } });
      if (!item) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Calender tidak ditemukan',
          data: null,
        };
      }
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Calender ditemukan',
        data: item,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mengambil calender',
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateCalenderDto: UpdateCalenderDto,
    user: any,
  ): Promise<ApiResponse> {
    try {
      const existing = await this.calenderRepository.findOne({
        where: { id },
      });
      if (!existing) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Calender tidak ditemukan',
          data: null,
        };
      }
      const targetUnit = updateCalenderDto.unit_id ?? existing.unit_id;
      const targetDate = updateCalenderDto.date ?? existing.date;
      const dup = await this.calenderRepository.findOne({
        where: { unit_id: targetUnit, date: targetDate },
      });
      if (dup && dup.id !== id) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'Tanggal sudah ada untuk unit ini',
          data: null,
        };
      }
      await this.calenderRepository.update(id, updateCalenderDto);
      const updated = await this.calenderRepository.findOne({ where: { id } });
      await this.logsService.logUpdate(
        user?.mapData?.nipBaru || 'system',
        'calender',
        id,
        `Mengubah calender: ${updated?.date}`,
      );
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Calender berhasil diupdate',
        data: updated,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mengupdate calender',
        data: null,
      };
    }
  }

  async remove(id: string, user: any): Promise<ApiResponse> {
    try {
      const existing = await this.calenderRepository.findOne({
        where: { id },
      });
      if (!existing) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Calender tidak ditemukan',
          data: null,
        };
      }
      await this.logsService.logDelete(
        user?.mapData?.nipBaru || 'system',
        'calender',
        id,
        `Menghapus calender: ${existing.date}`,
      );
      await this.calenderRepository.delete(id);
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Calender berhasil dihapus',
        data: { id },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal menghapus calender',
        data: null,
      };
    }
  }
}

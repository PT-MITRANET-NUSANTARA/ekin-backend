import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { FilterAbsenceDto } from './dto/filter-absence.dto';
import { Absence } from './entities/absence.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectRepository(Absence)
    private absenceRepository: Repository<Absence>,
  ) {}

  async create(
    createAbsenceDto: CreateAbsenceDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const absence = this.absenceRepository.create(createAbsenceDto);
      const savedAbsence = await this.absenceRepository.save(absence);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Absensi berhasil dibuat',
        data: savedAbsence,
      };
    } catch (error) {
      throw new BadRequestException(
        'Terjadi kesalahan saat membuat absensi: ' + error.message,
      );
    }
  }

  async findAll(
    filterAbsenceDto: FilterAbsenceDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const { page = 1, perPage = 10, ...filters } = filterAbsenceDto;
      const skip = (page - 1) * perPage;
      const take = perPage;

      const whereClause = {};

      // Menambahkan filter jika ada
      if (filters.user_id) {
        whereClause['user_id'] = filters.user_id;
      }

      if (filters.date) {
        whereClause['date'] = filters.date;
      }

      if (filters.status) {
        whereClause['status'] = filters.status;
      }

      if (filters.unit_id) {
        whereClause['unit_id'] = filters.unit_id;
      }

      const [absences, total] = await this.absenceRepository.findAndCount({
        where: whereClause,
        skip,
        take,
        order: { date: 'DESC' },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar absensi berhasil diambil',
        data: absences,
        pagination: {
          current_page: Number(page),
          per_page: Number(perPage),
          total,
          last_page: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Terjadi kesalahan saat mengambil daftar absensi: ' + error.message,
      );
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const absence = await this.absenceRepository.findOne({
        where: { id },
      });

      if (!absence) {
        throw new NotFoundException(`Absensi dengan ID ${id} tidak ditemukan`);
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Absensi berhasil ditemukan',
        data: absence,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Terjadi kesalahan saat mencari absensi: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateAbsenceDto: UpdateAbsenceDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const absence = await this.absenceRepository.findOne({
        where: { id },
      });

      if (!absence) {
        throw new NotFoundException(`Absensi dengan ID ${id} tidak ditemukan`);
      }

      await this.absenceRepository.update(id, updateAbsenceDto);

      const updatedAbsence = await this.absenceRepository.findOne({
        where: { id },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Absensi berhasil diperbarui',
        data: updatedAbsence,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Terjadi kesalahan saat memperbarui absensi: ' + error.message,
      );
    }
  }

  async remove(id: string, token: string): Promise<ApiResponse> {
    try {
      const absence = await this.absenceRepository.findOne({
        where: { id },
      });

      if (!absence) {
        throw new NotFoundException(`Absensi dengan ID ${id} tidak ditemukan`);
      }

      await this.absenceRepository.remove(absence);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Absensi berhasil dihapus',
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Terjadi kesalahan saat menghapus absensi: ' + error.message,
      );
    }
  }
}

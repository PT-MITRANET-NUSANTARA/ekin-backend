import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePenilaianDto } from './dto/create-penilaian.dto';
import { UpdatePenilaianDto } from './dto/update-penilaian.dto';
import { Penilaian } from './entities/penilaian.entity';
import { FilterPenilaianDto } from './dto/filter-penilaian.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class PenilaianService {
  constructor(
    @InjectRepository(Penilaian)
    private readonly penilaianRepository: Repository<Penilaian>,
  ) {}

  async create(
    createPenilaianDto: CreatePenilaianDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const penilaian = this.penilaianRepository.create({
        ...createPenilaianDto,
      });

      const result = await this.penilaianRepository.save(penilaian);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Penilaian berhasil dibuat',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        'Gagal membuat penilaian: ' + error.message,
      );
    }
  }

  async findAll(
    filterDto: FilterPenilaianDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        skp_dinilai_id,
        skp_penilai_id,
        periode_penilaian_id,
      } = filterDto;

      const queryBuilder =
        this.penilaianRepository.createQueryBuilder('penilaian');

      if (skp_dinilai_id) {
        queryBuilder.andWhere('penilaian.skp_dinilai_id = :skp_dinilai_id', {
          skp_dinilai_id,
        });
      }

      if (skp_penilai_id) {
        queryBuilder.andWhere('penilaian.skp_penilai_id = :skp_penilai_id', {
          skp_penilai_id,
        });
      }

      if (periode_penilaian_id) {
        queryBuilder.andWhere(
          'penilaian.periode_penilaian_id = :periode_penilaian_id',
          { periode_penilaian_id },
        );
      }

      const skip = (page - 1) * perPage;

      const [data, total] = await queryBuilder
        .skip(skip)
        .take(perPage)
        .orderBy('penilaian.created_at', 'DESC')
        .getManyAndCount();

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar penilaian berhasil diambil',
        data,
        pagination: {
          current_page: Number(page),
          per_page: Number(perPage),
          total,
          last_page: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Gagal mengambil daftar penilaian: ' + error.message,
      );
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const penilaian = await this.penilaianRepository.findOne({
        where: { id },
      });

      if (!penilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Penilaian dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Penilaian berhasil diambil',
        data: penilaian,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal mengambil penilaian: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updatePenilaianDto: UpdatePenilaianDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const penilaian = await this.penilaianRepository.findOne({
        where: { id },
      });

      if (!penilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Penilaian dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.penilaianRepository.update(id, {
        ...updatePenilaianDto,
      });

      const updatedPenilaian = await this.penilaianRepository.findOne({
        where: { id },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Penilaian berhasil diperbarui',
        data: updatedPenilaian,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal memperbarui penilaian: ' + error.message,
      );
    }
  }

  async remove(id: string, token: string): Promise<ApiResponse> {
    try {
      const penilaian = await this.penilaianRepository.findOne({
        where: { id },
      });

      if (!penilaian) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Penilaian dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.penilaianRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Penilaian berhasil dihapus',
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal menghapus penilaian: ' + error.message,
      );
    }
  }

  async findOrCreatePenilaian(
    skp_penilai_id: string,
    periode_penilaian_id: string,
    skp_dinilai_id: string,
  ): Promise<Penilaian> {
    // Cari penilaian berdasarkan kombinasi skp_penilai_id dan periode_penilaian_id
    let penilaian = await this.penilaianRepository.findOne({
      where: {
        skp_penilai_id,
        periode_penilaian_id,
        skp_dinilai_id,
      },
    });

    // Jika tidak ditemukan, buat record baru
    if (!penilaian) {
      penilaian = this.penilaianRepository.create({
        skp_penilai_id,
        periode_penilaian_id,
        skp_dinilai_id,
        rating_kinerja: 0,
        rating_perilaku: 0,
        rating_predikat: 0,
      });
      await this.penilaianRepository.save(penilaian);
    }

    return penilaian;
  }

  async updatePenilaianKinerja(
    skp_penilai_id: string,
    periode_penilaian_id: string,
    skp_dinilai_id: string,
    rating_kinerja: number,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const penilaian = await this.findOrCreatePenilaian(
        skp_penilai_id,
        periode_penilaian_id,
        skp_dinilai_id,
      );
      penilaian.rating_kinerja = rating_kinerja;
      const result = await this.penilaianRepository.save(penilaian);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Penilaian kinerja berhasil diperbarui',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        'Gagal memperbarui penilaian kinerja: ' + error.message,
      );
    }
  }

  async updatePenilaianPerilaku(
    skp_penilai_id: string,
    periode_penilaian_id: string,
    skp_dinilai_id: string,
    rating_perilaku: number,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const penilaian = await this.findOrCreatePenilaian(
        skp_penilai_id,
        periode_penilaian_id,
        skp_dinilai_id,
      );
      penilaian.rating_perilaku = rating_perilaku;
      const result = await this.penilaianRepository.save(penilaian);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Penilaian perilaku berhasil diperbarui',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        'Gagal memperbarui penilaian perilaku: ' + error.message,
      );
    }
  }

  async updatePenilaianPredikat(
    skp_penilai_id: string,
    periode_penilaian_id: string,
    skp_dinilai_id: string,
    rating_predikat: number,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const penilaian = await this.findOrCreatePenilaian(
        skp_penilai_id,
        periode_penilaian_id,
        skp_dinilai_id,
      );
      penilaian.rating_predikat = rating_predikat;
      const result = await this.penilaianRepository.save(penilaian);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Penilaian predikat berhasil diperbarui',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        'Gagal memperbarui penilaian predikat: ' + error.message,
      );
    }
  }
}

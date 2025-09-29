import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateUmpegDto } from './dto/create-umpeg.dto';
import { UpdateUmpegDto } from './dto/update-umpeg.dto';
import { FilterUmpegDto } from './dto/filter-umpeg.dto';
import { Umpeg } from './entities/umpeg.entity';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class UmpegService {
  constructor(
    @InjectRepository(Umpeg)
    private umpegRepository: Repository<Umpeg>,
    private unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createUmpegDto: CreateUmpegDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService
      const unitResponse = await this.unitKerjaService.findById(
        Number(createUmpegDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createUmpegDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Buat Umpeg
      const umpeg = this.umpegRepository.create({
        unit_id: createUmpegDto.unit_id,
        jabatan: createUmpegDto.jabatan,
      });

      const savedUmpeg = await this.umpegRepository.save(umpeg);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Umpeg berhasil dibuat',
        data: savedUmpeg,
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
    filterDto: FilterUmpegDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const { page = 1, perPage = 10, unit_id } = filterDto;

      const queryBuilder = this.umpegRepository.createQueryBuilder('umpeg');

      if (unit_id) {
        queryBuilder.andWhere('umpeg.unit_id = :unit_id', { unit_id });
      }

      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;

      queryBuilder.skip(offset).take(perPage);
      queryBuilder.orderBy('umpeg.created_at', 'DESC');

      const umpegs = await queryBuilder.getMany();

      // Ambil data unit untuk setiap Umpeg
      const unitPromises = umpegs.map((umpeg) =>
        this.unitKerjaService.findById(Number(umpeg.unit_id), token),
      );
      const unitResponses = await Promise.all(unitPromises);

      const umpegsWithUnit = umpegs.map((umpeg, index) => ({
        ...umpeg,
        unit: unitResponses[index].data,
      }));

      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total: total,
        last_page: totalPages,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar Umpeg berhasil diambil',
        data: umpegsWithUnit,
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
      const umpeg = await this.umpegRepository.findOne({
        where: { id },
      });

      if (!umpeg) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Umpeg dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Ambil data unit
      const unitResponse = await this.unitKerjaService.findById(
        Number(umpeg.unit_id),
        token,
      );

      const umpegWithUnit = {
        ...umpeg,
        unit: unitResponse.data,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Umpeg berhasil diambil',
        data: umpegWithUnit,
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
    updateUmpegDto: UpdateUmpegDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const umpeg = await this.umpegRepository.findOne({
        where: { id },
      });

      if (!umpeg) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Umpeg dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi unit_id jika ada
      if (updateUmpegDto.unit_id) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updateUmpegDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updateUmpegDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Update properti
      await this.umpegRepository.update(id, {
        ...(updateUmpegDto.unit_id && { unit_id: updateUmpegDto.unit_id }),
        ...(updateUmpegDto.jabatan && { jabatan: updateUmpegDto.jabatan }),
      });

      const updatedUmpeg = await this.umpegRepository.findOne({
        where: { id },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Umpeg berhasil diperbarui',
        data: updatedUmpeg,
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
      const umpeg = await this.umpegRepository.findOne({
        where: { id },
      });

      if (!umpeg) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Umpeg dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.umpegRepository.remove(umpeg);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Umpeg berhasil dihapus',
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

  async findByUnitAndJabatan(
    unitId: string,
    jabatan: string,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService
      const unitResponse = await this.unitKerjaService.findById(
        Number(unitId),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${unitId} tidak ditemukan`,
          data: null,
        };
      }

      // Cari umpeg berdasarkan unit_id
      const umpegs = await this.umpegRepository.find({
        where: { unit_id: unitId },
      });

      if (!umpegs || umpegs.length === 0) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Umpeg dengan unit ID ${unitId} tidak ditemukan`,
          data: null,
        };
      }

      // Filter umpeg yang memiliki jabatan yang dicari
      const filteredUmpegs = umpegs.filter((umpeg) => {
        return umpeg.jabatan.some((job) =>
          job.toLowerCase().includes(jabatan.toLowerCase()),
        );
      });

      if (filteredUmpegs.length === 0) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Jabatan ${jabatan} tidak ditemukan di unit ID ${unitId}`,
          data: null,
        };
      }

      // Tambahkan informasi unit ke hasil
      const umpegsWithUnit = filteredUmpegs.map((umpeg) => ({
        ...umpeg,
        unit: unitResponse.data,
      }));

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Umpeg berhasil ditemukan',
        data: umpegsWithUnit,
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

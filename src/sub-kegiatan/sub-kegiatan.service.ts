import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubKegiatanDto } from './dto/create-sub-kegiatan.dto';
import { UpdateSubKegiatanDto } from './dto/update-sub-kegiatan.dto';
import { SubKegiatan } from './entities/sub-kegiatan.entity';
import { Kegiatan } from '../kegiatan/entities/kegiatan.entity';
import { IndikatorKinerjaService } from '../indikator-kinerja/indikator-kinerja.service';
import { IndikatorKinerja } from '../indikator-kinerja/entities/indikator-kinerja.entity';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import {
  ApiResponse,
  PaginationMeta,
} from '../common/interfaces/api-response.interface';

@Injectable()
export class SubKegiatanService {
  constructor(
    @InjectRepository(SubKegiatan)
    private subKegiatanRepository: Repository<SubKegiatan>,
    @InjectRepository(Kegiatan)
    private kegiatanRepository: Repository<Kegiatan>,
    private indikatorKinerjaService: IndikatorKinerjaService,
    private unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createSubKegiatanDto: CreateSubKegiatanDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService
      const unitResponse = await this.unitKerjaService.findById(
        Number(createSubKegiatanDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createSubKegiatanDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi kegiatan_id
      const kegiatan = await this.kegiatanRepository.findOne({
        where: { id: createSubKegiatanDto.kegiatan_id },
      });

      if (!kegiatan) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Kegiatan dengan ID ${createSubKegiatanDto.kegiatan_id} tidak ditemukan`,
          data: null,
        };
      }

      // Buat indikator kinerja terlebih dahulu
      const indikatorKinerjas = await this.indikatorKinerjaService.createMany(
        createSubKegiatanDto.indikator_kinerja,
      );

      // Buat sub kegiatan dengan referensi ke indikator kinerja
      const subKegiatan = new SubKegiatan();
      subKegiatan.name = createSubKegiatanDto.name;
      subKegiatan.unit_id = createSubKegiatanDto.unit_id;
      subKegiatan.total_anggaran = createSubKegiatanDto.total_anggaran;
      subKegiatan.kegiatan_id = {
        id: createSubKegiatanDto.kegiatan_id,
      } as Kegiatan;
      subKegiatan.indikator_kinerja_id = indikatorKinerjas;

      const savedSubKegiatan =
        await this.subKegiatanRepository.save(subKegiatan);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Sub Kegiatan berhasil dibuat',
        data: savedSubKegiatan,
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

  async findAll(filterDto: any, token: string): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        search,
        unit_id,
        kegiatan_id,
      } = filterDto;

      const queryBuilder = this.subKegiatanRepository
        .createQueryBuilder('sub_kegiatan')
        .leftJoinAndSelect('sub_kegiatan.kegiatan_id', 'kegiatan')
        .leftJoinAndSelect(
          'sub_kegiatan.indikator_kinerja_id',
          'indikator_kinerja',
        );

      if (search) {
        queryBuilder.andWhere('sub_kegiatan.name LIKE :search', {
          search: `%${search}%`,
        });
      }

      if (unit_id) {
        queryBuilder.andWhere('sub_kegiatan.unit_id = :unit_id', { unit_id });
      }

      if (kegiatan_id) {
        queryBuilder.andWhere('kegiatan.id = :kegiatan_id', { kegiatan_id });
      }

      const total = await queryBuilder.getCount();
      const subKegiatans = await queryBuilder
        .skip((page - 1) * perPage)
        .take(perPage)
        .getMany();

      // Transform unit_id to unit data
      const transformedSubKegiatans = await Promise.all(
        subKegiatans.map(async (item) => {
          const unitResponse = await this.unitKerjaService.findById(
            Number(item.unit_id),
            token,
          );
          return {
            ...item,
            unit_id: unitResponse.data,
          };
        }),
      );

      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total,
        last_page: Math.ceil(total / perPage),
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar sub kegiatan berhasil diambil',
        data: transformedSubKegiatans,
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
      const subKegiatan = await this.subKegiatanRepository.findOne({
        where: { id },
        relations: ['kegiatan_id', 'indikator_kinerja_id'],
      });

      if (!subKegiatan) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Sub Kegiatan dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Transform unit_id to unit data
      const unitResponse = await this.unitKerjaService.findById(
        Number(subKegiatan.unit_id),
        token,
      );

      const transformedSubKegiatan = {
        ...subKegiatan,
        unit_id: unitResponse.data,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Sub Kegiatan berhasil diambil',
        data: transformedSubKegiatan,
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
    updateSubKegiatanDto: UpdateSubKegiatanDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const subKegiatan = await this.findOne(id, token);

      if (!subKegiatan.status) {
        return subKegiatan;
      }

      // Verifikasi unit_id jika ada
      if (updateSubKegiatanDto.unit_id) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updateSubKegiatanDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updateSubKegiatanDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Verifikasi kegiatan_id jika ada
      if (updateSubKegiatanDto.kegiatan_id) {
        const kegiatan = await this.kegiatanRepository.findOne({
          where: { id: updateSubKegiatanDto.kegiatan_id },
        });

        if (!kegiatan) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Kegiatan dengan ID ${updateSubKegiatanDto.kegiatan_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      await this.subKegiatanRepository.update(id, {
        name: updateSubKegiatanDto.name,
        unit_id: updateSubKegiatanDto.unit_id,
        total_anggaran: updateSubKegiatanDto.total_anggaran,
        kegiatan_id: updateSubKegiatanDto.kegiatan_id
          ? { id: updateSubKegiatanDto.kegiatan_id }
          : undefined,
      });

      // Update indikator kinerja jika ada
      if (
        updateSubKegiatanDto.indikator_kinerja &&
        updateSubKegiatanDto.indikator_kinerja.length > 0
      ) {
        // Implementasi update indikator kinerja
      }

      const updatedSubKegiatan = await this.findOne(id, token);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Sub Kegiatan berhasil diperbarui',
        data: updatedSubKegiatan.data,
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
      const subKegiatan = await this.findOne(id, token);

      if (!subKegiatan.status) {
        return subKegiatan;
      }

      await this.subKegiatanRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Sub Kegiatan berhasil dihapus',
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

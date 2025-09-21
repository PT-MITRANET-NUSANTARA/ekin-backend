import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { CreateTujuanDto } from './dto/create-tujuan.dto';
import { UpdateTujuanDto } from './dto/update-tujuan.dto';
import { FilterTujuanDto } from './dto/filter-tujuan.dto';
import { Tujuan } from './entities/tujuan.entity';
import { Renstra } from '../renstra/entities/renstra.entity';
import { IndikatorKinerjaService } from '../indikator-kinerja/indikator-kinerja.service';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import {
  ApiResponse,
  PaginationMeta,
} from '../common/interfaces/api-response.interface';

@Injectable()
export class TujuanService {
  constructor(
    @InjectRepository(Tujuan)
    private tujuanRepository: Repository<Tujuan>,
    private indikatorKinerjaService: IndikatorKinerjaService,
    private unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createTujuanDto: CreateTujuanDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService
      const unitResponse = await this.unitKerjaService.findById(
        Number(createTujuanDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createTujuanDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Buat indikator kinerja terlebih dahulu
      const indikatorKinerjas = await this.indikatorKinerjaService.createMany(
        createTujuanDto.indikator_kinerja,
      );

      // Buat tujuan dengan referensi ke indikator kinerja
      const tujuan = new Tujuan();
      tujuan.name = createTujuanDto.name;
      tujuan.unit_id = createTujuanDto.unit_id;
      if (createTujuanDto.renstra_id) {
        tujuan.renstra = { id: createTujuanDto.renstra_id } as Renstra;
      }
      tujuan.indikator_kinerja_id = indikatorKinerjas;

      const savedTujuan = await this.tujuanRepository.save(tujuan);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Tujuan berhasil dibuat',
        data: savedTujuan,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal membuat tujuan: ${error.message}`,
        data: null,
      };
    }
  }

  async findAll(
    filterDto: FilterTujuanDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const { search, unit_id, renstra_id, page = 1, perPage = 10 } = filterDto;

      const queryBuilder = this.tujuanRepository
        .createQueryBuilder('tujuan')
        .leftJoinAndSelect('tujuan.renstra', 'renstra')
        .leftJoinAndSelect('tujuan.indikator_kinerja_id', 'indikator_kinerja');

      // Apply filters
      if (search) {
        queryBuilder.andWhere('tujuan.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      if (unit_id) {
        queryBuilder.andWhere('tujuan.unit_id = :unit_id', { unit_id });
      }

      if (renstra_id) {
        queryBuilder.andWhere('tujuan.renstraId = :renstra_id', { renstra_id });
      }

      const total = await queryBuilder.getCount();

      const lastPage = Math.ceil(total / perPage);

      // Pagination
      const tujuanList = await queryBuilder
        .skip((page - 1) * perPage)
        .take(perPage)
        .orderBy('tujuan.createdAt', 'DESC')
        .getMany();

      // Transform unit_id menjadi data unit
      const transformedTujuanList = await Promise.all(
        tujuanList.map(async (tujuan) => {
          // Ambil data unit dari unit_id
          const unitResponse = await this.unitKerjaService.findById(
            parseInt(tujuan.unit_id),
            token,
          );

          // Buat objek baru dengan data unit
          return {
            ...tujuan,
            unit_id: unitResponse.status ? unitResponse.data : null,
          };
        }),
      );

      const pagination: PaginationMeta = {
        current_page: page,
        per_page: perPage,
        total,
        last_page: lastPage,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Data tujuan berhasil ditemukan',
        data: transformedTujuanList,
        pagination,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mendapatkan data tujuan: ${error.message}`,
        data: null,
      };
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const tujuan = await this.tujuanRepository.findOne({
        where: { id },
        relations: ['renstra', 'indikator_kinerja_id'],
      });

      if (!tujuan) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Tujuan dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Transform unit_id menjadi data unit
      const unitResponse = await this.unitKerjaService.findById(
        parseInt(tujuan.unit_id),
        token,
      );

      // Buat objek baru dengan data unit
      const transformedTujuan = {
        ...tujuan,
        unit_id: unitResponse.status ? unitResponse.data : null,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Data tujuan berhasil ditemukan',
        data: transformedTujuan,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mendapatkan data tujuan: ${error.message}`,
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateTujuanDto: UpdateTujuanDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const tujuanResponse = await this.findOne(id, token);

      if (!tujuanResponse.status) {
        return tujuanResponse;
      }

      const tujuan = tujuanResponse.data;

      // Verifikasi unit_id jika ada perubahan
      if (
        updateTujuanDto.unit_id &&
        updateTujuanDto.unit_id !== tujuan.unit_id
      ) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updateTujuanDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updateTujuanDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Update indikator kinerja jika ada
      if (
        updateTujuanDto.indikator_kinerja &&
        updateTujuanDto.indikator_kinerja.length > 0
      ) {
        // Hapus indikator kinerja lama dan buat yang baru
        // Ini adalah pendekatan sederhana, bisa dioptimalkan dengan update jika diperlukan
        const indikatorKinerjas = await this.indikatorKinerjaService.createMany(
          updateTujuanDto.indikator_kinerja,
        );
        tujuan.indikator_kinerja_id = indikatorKinerjas;
      }

      // Update properti tujuan
      if (updateTujuanDto.name) tujuan.name = updateTujuanDto.name;
      if (updateTujuanDto.unit_id) tujuan.unit_id = updateTujuanDto.unit_id;
      if (updateTujuanDto.renstra_id)
        tujuan.renstra = { id: updateTujuanDto.renstra_id } as Renstra;

      const updatedTujuan = await this.tujuanRepository.save(tujuan);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Tujuan berhasil diperbarui',
        data: updatedTujuan,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal memperbarui tujuan: ${error.message}`,
        data: null,
      };
    }
  }

  async remove(id: string, token: string): Promise<ApiResponse> {
    try {
      const tujuanResponse = await this.findOne(id, token);

      if (!tujuanResponse.status) {
        return tujuanResponse;
      }

      const tujuan = tujuanResponse.data;
      await this.tujuanRepository.remove(tujuan);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Tujuan berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal menghapus tujuan: ${error.message}`,
        data: null,
      };
    }
  }
}

import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateRenstraDto } from './dto/create-renstra.dto';
import { UpdateRenstraDto } from './dto/update-renstra.dto';
import { FilterRenstraDto } from './dto/filter-renstra.dto';
import { Renstra } from './entities/renstra.entity';
import { Misi } from '../misi/entities/misi.entity';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import {
  ApiResponse,
  PaginationMeta,
} from '../common/interfaces/api-response.interface';

@Injectable()
export class RenstraService {
  constructor(
    @InjectRepository(Renstra)
    private readonly renstraRepository: Repository<Renstra>,
    @InjectRepository(Misi)
    private readonly misiRepository: Repository<Misi>,
    private readonly unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createRenstraDto: CreateRenstraDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil unit kerja service
      const unitResponse = await this.unitKerjaService.findById(
        parseInt(createRenstraDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'Unit kerja tidak ditemukan',
          data: null,
        };
      }

      // Verifikasi misi_ids
      const misiList = await this.misiRepository.find({
        where: { id: In(createRenstraDto.misi_ids) },
      });

      if (misiList.length !== createRenstraDto.misi_ids.length) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'Beberapa misi tidak ditemukan',
          data: null,
        };
      }

      // Buat renstra baru
      const renstra = this.renstraRepository.create({
        periode_start: new Date(createRenstraDto.periode_start),
        periode_end: new Date(createRenstraDto.periode_end),
        unit_id: createRenstraDto.unit_id,
        misi_id: misiList,
      });

      const savedRenstra = await this.renstraRepository.save(renstra);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Renstra berhasil dibuat',
        data: savedRenstra,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal membuat renstra',
        data: null,
      };
    }
  }

  async findAll(
    filterDto: FilterRenstraDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const {
        search,
        periode_start,
        periode_end,
        unit_id,
        misi_ids,
        page = 1,
        perPage = 10,
      } = filterDto;

      const queryBuilder = this.renstraRepository
        .createQueryBuilder('renstra')
        .leftJoinAndSelect('renstra.misi_id', 'misi');

      // Filter berdasarkan unit_id
      if (unit_id) {
        queryBuilder.andWhere('renstra.unit_id = :unit_id', { unit_id });
      }

      // Filter berdasarkan periode
      if (periode_start) {
        queryBuilder.andWhere('renstra.periode_start >= :periode_start', {
          periode_start: new Date(periode_start),
        });
      }

      if (periode_end) {
        queryBuilder.andWhere('renstra.periode_end <= :periode_end', {
          periode_end: new Date(periode_end),
        });
      }

      // Filter berdasarkan misi_ids
      if (misi_ids && misi_ids.length > 0) {
        queryBuilder.andWhere('misi.id IN (:...misi_ids)', { misi_ids });
      }

      // Hitung total items untuk pagination
      const total = await queryBuilder.getCount();

      // Calculate last page
      const lastPage = Math.ceil(total / perPage);

      // Tambahkan pagination
      const renstraList = await queryBuilder
        .skip((page - 1) * perPage)
        .take(perPage)
        .orderBy('renstra.createdAt', 'DESC')
        .getMany();

      // Transform unit_id menjadi data unit
      const transformedRenstraList = await Promise.all(
        renstraList.map(async (renstra) => {
          // Ambil data unit dari unit_id
          const unitResponse = await this.unitKerjaService.findById(
            parseInt(renstra.unit_id),
            token,
          );

          // Buat objek baru dengan data unit
          return {
            ...renstra,
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
        message: 'Berhasil mengambil data renstra',
        data: transformedRenstraList,
        pagination,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data renstra',
        data: null,
      };
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const renstra = await this.renstraRepository.findOne({
        where: { id },
        relations: ['misi'],
      });

      if (!renstra) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Renstra tidak ditemukan',
          data: null,
        };
      }

      // Ambil data unit dari unit_id
      const unitResponse = await this.unitKerjaService.findById(
        parseInt(renstra.unit_id),
        token,
      );

      // Tambahkan data unit ke response
      const renstraWithUnitData = {
        ...renstra,
        unit_id: unitResponse.status ? unitResponse.data : null,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data renstra',
        data: renstraWithUnitData,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data renstra',
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateRenstraDto: UpdateRenstraDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const renstra = await this.renstraRepository.findOne({
        where: { id },
        relations: ['misi'],
      });

      if (!renstra) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Renstra tidak ditemukan',
          data: null,
        };
      }

      // Update misi jika ada
      if (updateRenstraDto.misi_ids) {
        const misiList = await this.misiRepository.find({
          where: { id: In(updateRenstraDto.misi_ids) },
        });

        if (misiList.length !== updateRenstraDto.misi_ids.length) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: 'Beberapa misi tidak ditemukan',
            data: null,
          };
        }

        renstra.misi_id = misiList;
      }

      // Update field lainnya
      if (updateRenstraDto.periode_start) {
        renstra.periode_start = new Date(updateRenstraDto.periode_start);
      }

      if (updateRenstraDto.periode_end) {
        renstra.periode_end = new Date(updateRenstraDto.periode_end);
      }

      if (updateRenstraDto.unit_id) {
        // Verifikasi unit_id dengan memanggil unit kerja service
        const unitResponse = await this.unitKerjaService.findById(
          parseInt(updateRenstraDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: 'Unit kerja tidak ditemukan',
            data: null,
          };
        }

        renstra.unit_id = updateRenstraDto.unit_id;
      }

      const updatedRenstra = await this.renstraRepository.save(renstra);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Renstra berhasil diperbarui',
        data: updatedRenstra,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal memperbarui renstra',
        data: null,
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const renstra = await this.renstraRepository.findOne({
        where: { id },
      });

      if (!renstra) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Renstra tidak ditemukan',
          data: null,
        };
      }

      await this.renstraRepository.remove(renstra);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Renstra berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal menghapus renstra',
        data: null,
      };
    }
  }
}

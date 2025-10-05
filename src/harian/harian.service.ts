import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateHarianDto } from './dto/create-harian.dto';
import { UpdateHarianDto } from './dto/update-harian.dto';
import { Harian } from './entities/harian.entity';
import { FilterHarianDto } from './dto/filter-harian.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { RencanaAksi } from '../rencana-aksi/entities/rencana-aksi.entity';

@Injectable()
export class HarianService {
  constructor(
    @InjectRepository(Harian)
    private readonly harianRepository: Repository<Harian>,
    @InjectRepository(RencanaAksi)
    private readonly rencanaAksiRepository: Repository<RencanaAksi>,
  ) {}

  async create(createHarianDto: CreateHarianDto): Promise<ApiResponse> {
    try {
      const { rencana_aksi_ids, ...harianData } = createHarianDto;

      // Buat instance harian
      const harian = this.harianRepository.create(harianData);

      // Jika ada rencana_aksi_ids, tambahkan relasi
      if (rencana_aksi_ids && rencana_aksi_ids.length > 0) {
        const rencanaAksiList = await this.rencanaAksiRepository.find({
          where: { id: In(rencana_aksi_ids) },
        });

        if (rencanaAksiList.length !== rencana_aksi_ids.length) {
          throw new BadRequestException('Beberapa ID rencana aksi tidak valid');
        }

        harian.rencana_aksi = rencanaAksiList;
      }

      // Simpan harian
      await this.harianRepository.save(harian);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Data harian berhasil dibuat',
        data: harian,
      };
    } catch (error) {
      return {
        code: HttpStatus.BAD_REQUEST,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }

  async findAll(filterDto: FilterHarianDto): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        user_id,
        date,
        skp_id,
        rhk_id,
        is_skp,
        search,
        rencana_aksi_id,
        start_date_time,
        end_date_time,
      } = filterDto;

      const queryBuilder = this.harianRepository
        .createQueryBuilder('harian')
        .leftJoinAndSelect('harian.rencana_aksi', 'rencana_aksi');

      // Terapkan filter
      if (user_id) {
        queryBuilder.andWhere('harian.user_id = :user_id', { user_id });
      }

      if (date) {
        queryBuilder.andWhere('harian.date = :date', { date });
      }

      if (skp_id !== undefined) {
        queryBuilder.andWhere('harian.skp_id = :skp_id', { skp_id });
      }
      
      if (rhk_id !== undefined) {
        queryBuilder.andWhere('harian.rhk_id = :rhk_id', { rhk_id });
      }

      if (is_skp !== undefined) {
        queryBuilder.andWhere('harian.is_skp = :is_skp', { is_skp });
      }

      if (search) {
        queryBuilder.andWhere(
          '(harian.name LIKE :search OR harian.desc LIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (rencana_aksi_id) {
        queryBuilder.andWhere('rencana_aksi.id = :rencana_aksi_id', {
          rencana_aksi_id,
        });
      }

      // Hitung total data
      const total = await queryBuilder.getCount();

      // Terapkan paginasi
      const data = await queryBuilder
        .skip((page - 1) * perPage)
        .take(perPage)
        .getMany();

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Data harian berhasil diambil',
        data,
        pagination: {
          current_page: Number(page),
          per_page: Number(perPage),
          total,
          last_page: Math.ceil(total / perPage),
        },
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

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const harian = await this.harianRepository.findOne({
        where: { id },
        relations: ['rencana_aksi'],
      });

      if (!harian) {
        throw new NotFoundException(
          `Data harian dengan ID ${id} tidak ditemukan`,
        );
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Data harian berhasil ditemukan',
        data: harian,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: error.message,
          data: null,
        };
      }

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
    updateHarianDto: UpdateHarianDto,
  ): Promise<ApiResponse> {
    try {
      const harian = await this.harianRepository.findOne({
        where: { id },
        relations: ['rencana_aksi'],
      });

      if (!harian) {
        throw new NotFoundException(
          `Data harian dengan ID ${id} tidak ditemukan`,
        );
      }

      const { rencana_aksi_ids, ...harianData } = updateHarianDto;

      // Update data harian
      Object.assign(harian, harianData);

      // Jika ada rencana_aksi_ids, update relasi
      if (rencana_aksi_ids) {
        const rencanaAksiList = await this.rencanaAksiRepository.find({
          where: { id: In(rencana_aksi_ids) },
        });

        if (rencanaAksiList.length !== rencana_aksi_ids.length) {
          throw new BadRequestException('Beberapa ID rencana aksi tidak valid');
        }

        harian.rencana_aksi = rencanaAksiList;
      }

      // Simpan perubahan
      await this.harianRepository.save(harian);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Data harian berhasil diperbarui',
        data: harian,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: error.message,
          data: null,
        };
      }

      if (error instanceof BadRequestException) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: error.message,
          data: null,
        };
      }

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
      const harian = await this.harianRepository.findOne({
        where: { id },
      });

      if (!harian) {
        throw new NotFoundException(
          `Data harian dengan ID ${id} tidak ditemukan`,
        );
      }

      await this.harianRepository.remove(harian);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Data harian berhasil dihapus',
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: error.message,
          data: null,
        };
      }

      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan: ${error.message}`,
        data: null,
      };
    }
  }
}

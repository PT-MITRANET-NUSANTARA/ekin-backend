import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateSkpDto } from './dto/create-skp.dto';
import { UpdateSkpDto } from './dto/update-skp.dto';
import { FilterSkpDto } from './dto/filter-skp.dto';
import { Skp, SkpStatus } from './entities/skp.entity';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class SkpService {
  constructor(
    @InjectRepository(Skp)
    private skpRepository: Repository<Skp>,
    private unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createSkpDto: CreateSkpDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService
      const unitResponse = await this.unitKerjaService.findById(
        Number(createSkpDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createSkpDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Set default status jika tidak ada
      if (!createSkpDto.status) {
        createSkpDto.status = SkpStatus.DRAFT;
      }

      // Simpan data SKP
      const skp = this.skpRepository.create(createSkpDto);
      const savedSkp = await this.skpRepository.save(skp);

      // Ambil data SKP yang baru disimpan beserta unit kerja
      const newSkp = await this.skpRepository.findOne({
        where: { id: savedSkp.id },
      });

      // Tambahkan informasi unit kerja
      const skpWithUnit = {
        ...newSkp,
        unit: unitResponse.data,
      };

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'SKP berhasil dibuat',
        data: skpWithUnit,
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
    filterSkpDto: FilterSkpDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const { page = 1, perPage = 10, user_id, unit_id, status, pendekatan } = filterSkpDto;
      
      // Buat query builder
      const queryBuilder = this.skpRepository.createQueryBuilder('skp');
      
      // Tambahkan filter jika ada
      if (user_id) {
        queryBuilder.andWhere('skp.user_id = :user_id', { user_id });
      }
      
      if (unit_id) {
        queryBuilder.andWhere('skp.unit_id = :unit_id', { unit_id });
      }
      
      if (status) {
        queryBuilder.andWhere('skp.status = :status', { status });
      }
      
      if (pendekatan) {
        queryBuilder.andWhere('skp.pendekatan = :pendekatan', { pendekatan });
      }
      
      // Hitung total data
      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;
      
      // Tambahkan pagination
      queryBuilder
        .skip(offset)
        .take(perPage)
        .orderBy('skp.created_at', 'DESC');
      
      // Ambil data
      const skpList = await queryBuilder.getMany();
      
      // Tambahkan informasi unit kerja untuk setiap SKP
      const skpWithUnitPromises = skpList.map(async (skp) => {
        const unitResponse = await this.unitKerjaService.findById(
          Number(skp.unit_id),
          token,
        );
        
        return {
          ...skp,
          unit: unitResponse.status ? unitResponse.data : null,
        };
      });
      
      const skpWithUnit = await Promise.all(skpWithUnitPromises);
      
      // Buat pagination meta
      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total: total,
        last_page: totalPages,
      };
      
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar SKP berhasil diambil',
        data: skpWithUnit,
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
      const skp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!skp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Ambil informasi unit kerja
      const unitResponse = await this.unitKerjaService.findById(
        Number(skp.unit_id),
        token,
      );

      const skpWithUnit = {
        ...skp,
        unit: unitResponse.status ? unitResponse.data : null,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'SKP berhasil diambil',
        data: skpWithUnit,
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

  async findByUserId(userId: string, token: string): Promise<ApiResponse> {
    try {
      const skpList = await this.skpRepository.find({ 
        where: { user_id: userId },
        order: { created_at: 'DESC' }
      });

      if (skpList.length === 0) {
        return {
          code: HttpStatus.OK,
          status: true,
          message: `Tidak ada SKP yang ditemukan untuk user ID ${userId}`,
          data: [],
        };
      }

      // Ambil data unit untuk setiap SKP
      const skpWithUnitPromises = skpList.map(async (skp) => {
        const unitResponse = await this.unitKerjaService.findById(
          Number(skp.unit_id),
          token,
        );
        
        return {
          ...skp,
          unit: unitResponse.status ? unitResponse.data : null,
        };
      });

      const skpWithUnit = await Promise.all(skpWithUnitPromises);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar SKP berhasil ditemukan',
        data: skpWithUnit,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Terjadi kesalahan saat mencari SKP berdasarkan user ID: ${error.message}`,
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateSkpDto: UpdateSkpDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Cek apakah SKP ada
      const skp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!skp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Jika ada unit_id baru, verifikasi
      if (updateSkpDto.unit_id) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updateSkpDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updateSkpDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Update SKP
      await this.skpRepository.update(id, updateSkpDto);

      // Ambil data SKP yang sudah diupdate
      const updatedSkp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!updatedSkp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan setelah update`,
          data: null,
        };
      }

      // Ambil informasi unit kerja
      const unitResponse = await this.unitKerjaService.findById(
        Number(updatedSkp.unit_id),
        token,
      );

      const skpWithUnit = {
        ...updatedSkp,
        unit: unitResponse.status ? unitResponse.data : null,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'SKP berhasil diperbarui',
        data: skpWithUnit,
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
      // Cek apakah SKP ada
      const skp = await this.skpRepository.findOne({
        where: { id },
      });

      if (!skp) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `SKP dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Hapus SKP
      await this.skpRepository.remove(skp);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'SKP berhasil dihapus',
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


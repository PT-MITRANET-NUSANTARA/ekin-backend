import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateKegiatanDto } from './dto/create-kegiatan.dto';
import { UpdateKegiatanDto } from './dto/update-kegiatan.dto';
import { Kegiatan } from './entities/kegiatan.entity';
import { Program } from '../program/entities/program.entity';
import { IndikatorKinerjaService } from '../indikator-kinerja/indikator-kinerja.service';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import {
  ApiResponse,
  PaginationMeta,
} from '../common/interfaces/api-response.interface';

@Injectable()
export class KegiatanService {
  constructor(
    @InjectRepository(Kegiatan)
    private kegiatanRepository: Repository<Kegiatan>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    private indikatorKinerjaService: IndikatorKinerjaService,
    private unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createKegiatanDto: CreateKegiatanDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService
      const unitResponse = await this.unitKerjaService.findById(
        Number(createKegiatanDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createKegiatanDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi program_id
      const program = await this.programRepository.findOne({
        where: { id: createKegiatanDto.program_id },
      });

      if (!program) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Program dengan ID ${createKegiatanDto.program_id} tidak ditemukan`,
          data: null,
        };
      }

      // Buat indikator kinerja terlebih dahulu
      const indikatorKinerjas = await this.indikatorKinerjaService.createMany(
        createKegiatanDto.indikator_kinerja,
      );

      // Buat kegiatan dengan referensi ke indikator kinerja
      const kegiatan = this.kegiatanRepository.create({
        name: createKegiatanDto.name,
        unit_id: createKegiatanDto.unit_id,
        total_anggaran: createKegiatanDto.total_anggaran,
        program_id: { id: createKegiatanDto.program_id } as Program,
        indikator_kinerja_id: indikatorKinerjas,
      });

      const savedKegiatan = await this.kegiatanRepository.save(kegiatan);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Kegiatan berhasil dibuat',
        data: savedKegiatan,
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
      const { page = 1, perPage = 10, search, unit_id, program_id } = filterDto;

      const queryBuilder = this.kegiatanRepository
        .createQueryBuilder('kegiatan')
        .leftJoinAndSelect('kegiatan.program_id', 'program')
        .leftJoinAndSelect(
          'kegiatan.indikator_kinerja_id',
          'indikator_kinerja',
        );

      if (search) {
        queryBuilder.andWhere('kegiatan.name LIKE :search', {
          search: `%${search}%`,
        });
      }

      if (unit_id) {
        queryBuilder.andWhere('kegiatan.unit_id = :unit_id', { unit_id });
      }

      if (program_id) {
        queryBuilder.andWhere('program.id = :program_id', { program_id });
      }

      const total = await queryBuilder.getCount();
      const kegiatans = await queryBuilder
        .skip((page - 1) * perPage)
        .take(perPage)
        .getMany();

      // Transform unit_id to unit data
      const transformedKegiatans = await Promise.all(
        kegiatans.map(async (item) => {
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
        message: 'Daftar kegiatan berhasil diambil',
        data: transformedKegiatans,
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
      const kegiatan = await this.kegiatanRepository.findOne({
        where: { id },
        relations: ['program_id', 'indikator_kinerja_id'],
      });

      if (!kegiatan) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Kegiatan dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Transform unit_id to unit data
      const unitResponse = await this.unitKerjaService.findById(
        Number(kegiatan.unit_id),
        token,
      );

      const transformedKegiatan = {
        ...kegiatan,
        unit_id: unitResponse.data,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Kegiatan berhasil ditemukan',
        data: transformedKegiatan,
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
    updateKegiatanDto: UpdateKegiatanDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const kegiatan = await this.kegiatanRepository.findOne({
        where: { id },
        relations: ['indikator_kinerja_id'],
      });

      if (!kegiatan) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Kegiatan dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi unit_id jika ada
      if (updateKegiatanDto.unit_id) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updateKegiatanDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updateKegiatanDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Verifikasi program_id jika ada
      if (updateKegiatanDto.program_id) {
        const program = await this.programRepository.findOne({
          where: { id: updateKegiatanDto.program_id },
        });

        if (!program) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Program dengan ID ${updateKegiatanDto.program_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Update indikator kinerja jika ada
      if (updateKegiatanDto.indikator_kinerja) {
        // Hapus indikator kinerja lama
        await Promise.all(
          kegiatan.indikator_kinerja_id.map(async (ik) => {
            await this.indikatorKinerjaService.remove(ik.id);
          }),
        );

        // Buat indikator kinerja baru
        const indikatorKinerjas = await this.indikatorKinerjaService.createMany(
          updateKegiatanDto.indikator_kinerja,
        );

        kegiatan.indikator_kinerja_id = indikatorKinerjas;
      }

      // Update properti kegiatan
      if (updateKegiatanDto.name) kegiatan.name = updateKegiatanDto.name;
      if (updateKegiatanDto.unit_id)
        kegiatan.unit_id = updateKegiatanDto.unit_id;
      if (updateKegiatanDto.total_anggaran)
        kegiatan.total_anggaran = updateKegiatanDto.total_anggaran;
      if (updateKegiatanDto.program_id) {
        kegiatan.program_id = { id: updateKegiatanDto.program_id } as Program;
      }

      const updatedKegiatan = await this.kegiatanRepository.save(kegiatan);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Kegiatan berhasil diperbarui',
        data: updatedKegiatan,
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
      const kegiatan = await this.kegiatanRepository.findOne({
        where: { id },
        relations: ['indikator_kinerja_id'],
      });

      if (!kegiatan) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Kegiatan dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Hapus indikator kinerja terkait
      await Promise.all(
        kegiatan.indikator_kinerja_id.map(async (ik) => {
          await this.indikatorKinerjaService.remove(ik.id);
        }),
      );

      // Hapus kegiatan
      await this.kegiatanRepository.remove(kegiatan);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Kegiatan berhasil dihapus',
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

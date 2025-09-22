import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { FilterProgramDto } from './dto/filter-program.dto';
import { Program } from './entities/program.entity';
import { Tujuan } from '../tujuan/entities/tujuan.entity';
import { IndikatorKinerjaService } from '../indikator-kinerja/indikator-kinerja.service';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import {
  ApiResponse,
  PaginationMeta,
} from '../common/interfaces/api-response.interface';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    private indikatorKinerjaService: IndikatorKinerjaService,
    private unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createProgramDto: CreateProgramDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService
      const unitResponse = await this.unitKerjaService.findById(
        Number(createProgramDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createProgramDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Buat indikator kinerja terlebih dahulu
      const indikatorKinerjas = await this.indikatorKinerjaService.createMany(
        createProgramDto.indikator_kinerja,
      );

      // Buat program dengan referensi ke indikator kinerja
      const program = new Program();
      program.name = createProgramDto.name;
      program.unit_id = createProgramDto.unit_id;
      program.total_anggaran = createProgramDto.total_anggaran;
      program.tujuan_id = { id: createProgramDto.tujuan_id } as Tujuan;
      program.indikator_kinerja_id = indikatorKinerjas;

      const savedProgram = await this.programRepository.save(program);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Program berhasil dibuat',
        data: savedProgram,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal membuat program: ${error.message}`,
        data: null,
      };
    }
  }

  async findAll(
    filterDto: FilterProgramDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const { search, unit_id, tujuan_id, page = 1, perPage = 10 } = filterDto;

      const queryBuilder = this.programRepository
        .createQueryBuilder('program')
        .leftJoinAndSelect('program.tujuan_id', 'tujuan')
        .leftJoinAndSelect('program.indikator_kinerja_id', 'indikator_kinerja');

      // Apply filters
      if (search) {
        queryBuilder.andWhere('program.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      if (unit_id) {
        queryBuilder.andWhere('program.unit_id = :unit_id', { unit_id });
      }

      if (tujuan_id) {
        queryBuilder.andWhere('program.tujuan_id = :tujuan_id', { tujuan_id });
      }

      // Apply pagination
      const total = await queryBuilder.getCount();

      // Get paginated results
      const lastPage = Math.ceil(total / perPage);

      const programList = await queryBuilder
        .skip((page - 1) * perPage)
        .take(perPage)
        .orderBy('program.createdAt', 'DESC')
        .getMany();

      // Transform unit_id to unit data
      const transformedProgramList = await Promise.all(
        programList.map(async (item) => {
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

      const pagination: PaginationMeta = {
        current_page: page,
        per_page: perPage,
        total: total,
        last_page: lastPage,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Program berhasil ditemukan',
        data: transformedProgramList,
        pagination,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mendapatkan program: ${error.message}`,
        data: null,
      };
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const program = await this.programRepository.findOne({
        where: { id },
        relations: ['tujuan_id', 'indikator_kinerja_id'],
      });

      if (!program) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Program dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Transform unit_id to unit data
      const unitResponse = await this.unitKerjaService.findById(
        Number(program.unit_id),
        token,
      );

      const transformedProgram = {
        ...program,
        unit_id: unitResponse.data,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Program berhasil ditemukan',
        data: transformedProgram,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mendapatkan program: ${error.message}`,
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateProgramDto: UpdateProgramDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const program = await this.programRepository.findOne({
        where: { id },
        relations: ['tujuan_id', 'indikator_kinerja_id'],
      });

      if (!program) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Program dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi unit_id jika ada
      if (updateProgramDto.unit_id) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updateProgramDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updateProgramDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Update indikator kinerja jika ada
      if (updateProgramDto.indikator_kinerja) {
        // Hapus indikator kinerja lama
        await Promise.all(
          program.indikator_kinerja_id.map(async (ik) => {
            await this.indikatorKinerjaService.remove(ik.id);
          }),
        );

        // Buat indikator kinerja baru
        const indikatorKinerjas = await this.indikatorKinerjaService.createMany(
          updateProgramDto.indikator_kinerja,
        );

        program.indikator_kinerja_id = indikatorKinerjas;
      }

      // Update properti program
      if (updateProgramDto.name) program.name = updateProgramDto.name;
      if (updateProgramDto.unit_id) program.unit_id = updateProgramDto.unit_id;
      if (updateProgramDto.total_anggaran)
        program.total_anggaran = updateProgramDto.total_anggaran;
      if (updateProgramDto.tujuan_id)
        program.tujuan_id = { id: updateProgramDto.tujuan_id } as Tujuan;

      const updatedProgram = await this.programRepository.save(program);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Program berhasil diperbarui',
        data: updatedProgram,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal memperbarui program: ${error.message}`,
        data: null,
      };
    }
  }

  async remove(id: string, token: string): Promise<ApiResponse> {
    try {
      const programResponse = await this.findOne(id, token);
      if (!programResponse.status) {
        return programResponse;
      }

      await this.programRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Program berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal menghapus program: ${error.message}`,
        data: null,
      };
    }
  }
}

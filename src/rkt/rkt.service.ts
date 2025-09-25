import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { CreateRktDto } from './dto/create-rkt.dto';
import { UpdateRktDto } from './dto/update-rkt.dto';
import { FilterRktDto } from './dto/filter-rkt.dto';
import { Rkt } from './entities/rkt.entity';
import { SubKegiatan } from '../sub-kegiatan/entities/sub-kegiatan.entity';
import { IndikatorKinerjaService } from '../indikator-kinerja/indikator-kinerja.service';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class RktService {
  constructor(
    @InjectRepository(Rkt)
    private rktRepository: Repository<Rkt>,
    @InjectRepository(SubKegiatan)
    private subKegiatanRepository: Repository<SubKegiatan>,
    private indikatorKinerjaService: IndikatorKinerjaService,
    private unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createRktDto: CreateRktDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id dengan memanggil UnitKerjaService
      const unitResponse = await this.unitKerjaService.findById(
        Number(createRktDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createRktDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi sub_kegiatan_id
      const subKegiatanPromises = createRktDto.sub_kegiatan_id.map((id) =>
        this.subKegiatanRepository.findOne({ where: { id } }),
      );
      const subKegiatans = await Promise.all(subKegiatanPromises);

      const invalidSubKegiatan = subKegiatans.findIndex((sk) => !sk);
      if (invalidSubKegiatan !== -1) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Sub Kegiatan dengan ID ${createRktDto.sub_kegiatan_id[invalidSubKegiatan]} tidak ditemukan`,
          data: null,
        };
      }

      // Buat indikator kinerja untuk input, output, dan outcome
      const inputIndikatorKinerjas =
        await this.indikatorKinerjaService.createMany(
          createRktDto.input_indikator_kinerja,
        );

      const outputIndikatorKinerjas =
        await this.indikatorKinerjaService.createMany(
          createRktDto.output_indikator_kinerja,
        );

      const outcomeIndikatorKinerjas =
        await this.indikatorKinerjaService.createMany(
          createRktDto.outcome_indikator_kinerja,
        );

      // Buat RKT dengan referensi ke indikator kinerja dan sub kegiatan
      const rkt = this.rktRepository.create({
        name: createRktDto.name,
        unit_id: createRktDto.unit_id,
        label: createRktDto.label,
        total_anggaran: createRktDto.total_anggaran,
        renstra_id: createRktDto.renstra_id,
        sub_kegiatan_id: subKegiatans.filter(
          (sk) => sk !== null,
        ) as SubKegiatan[],
        input_indikator_kinerja: inputIndikatorKinerjas,
        output_indikator_kinerja: outputIndikatorKinerjas,
        outcome_indikator_kinerja: outcomeIndikatorKinerjas,
      });

      const savedRkt = await this.rktRepository.save(rkt);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'RKT berhasil dibuat',
        data: savedRkt,
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

  async findAll(filterDto: FilterRktDto, token: string): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        name,
        unit_id,
        renstra_id,
        label,
      } = filterDto;

      const queryBuilder = this.rktRepository
        .createQueryBuilder('rkt')
        .leftJoinAndSelect('rkt.sub_kegiatan_id', 'sub_kegiatan')
        .leftJoinAndSelect('rkt.input_indikator_kinerja', 'input_indikator')
        .leftJoinAndSelect('rkt.output_indikator_kinerja', 'output_indikator')
        .leftJoinAndSelect(
          'rkt.outcome_indikator_kinerja',
          'outcome_indikator',
        );

      if (name) {
        queryBuilder.andWhere('rkt.name LIKE :name', {
          name: `%${name}%`,
        });
      }

      if (unit_id) {
        queryBuilder.andWhere('rkt.unit_id = :unit_id', { unit_id });
      }

      if (renstra_id) {
        queryBuilder.andWhere('rkt.renstra_id = :renstra_id', { renstra_id });
      }

      if (label) {
        queryBuilder.andWhere('rkt.label = :label', { label });
      }

      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;

      queryBuilder.skip(offset).take(perPage);
      queryBuilder.orderBy('rkt.created_at', 'DESC');

      const rkts = await queryBuilder.getMany();

      // Ambil data unit untuk setiap RKT
      const unitPromises = rkts.map((rkt) =>
        this.unitKerjaService.findById(Number(rkt.unit_id), token),
      );
      const unitResponses = await Promise.all(unitPromises);

      const rktsWithUnit = rkts.map((rkt, index) => ({
        ...rkt,
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
        message: 'Daftar RKT berhasil diambil',
        data: rktsWithUnit,
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
      const rkt = await this.rktRepository.findOne({
        where: { id },
        relations: [
          'sub_kegiatan_id',
          'input_indikator_kinerja',
          'output_indikator_kinerja',
          'outcome_indikator_kinerja',
        ],
      });

      if (!rkt) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `RKT dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Ambil data unit
      const unitResponse = await this.unitKerjaService.findById(
        Number(rkt.unit_id),
        token,
      );

      const rktWithUnit = {
        ...rkt,
        unit: unitResponse.data,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RKT berhasil diambil',
        data: rktWithUnit,
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
    updateRktDto: UpdateRktDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const rkt = await this.rktRepository.findOne({
        where: { id },
        relations: [
          'sub_kegiatan_id',
          'input_indikator_kinerja',
          'output_indikator_kinerja',
          'outcome_indikator_kinerja',
        ],
      });

      if (!rkt) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `RKT dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi unit_id jika ada
      if (updateRktDto.unit_id) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updateRktDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updateRktDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Verifikasi sub_kegiatan_id jika ada
      if (
        updateRktDto.sub_kegiatan_id &&
        updateRktDto.sub_kegiatan_id.length > 0
      ) {
        const subKegiatanPromises = updateRktDto.sub_kegiatan_id.map((id) =>
          this.subKegiatanRepository.findOne({ where: { id } }),
        );
        const subKegiatans = await Promise.all(subKegiatanPromises);

        const invalidSubKegiatan = subKegiatans.findIndex((sk) => !sk);
        if (invalidSubKegiatan !== -1) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Sub Kegiatan dengan ID ${updateRktDto.sub_kegiatan_id[invalidSubKegiatan]} tidak ditemukan`,
            data: null,
          };
        }

        // Update sub kegiatan
        rkt.sub_kegiatan_id = subKegiatans.filter(
          (sk) => sk !== null,
        ) as SubKegiatan[];
      }

      // Update indikator kinerja jika ada
      if (
        updateRktDto.input_indikator_kinerja &&
        updateRktDto.input_indikator_kinerja.length > 0
      ) {
        const inputIndikatorKinerjas =
          await this.indikatorKinerjaService.createMany(
            updateRktDto.input_indikator_kinerja,
          );
        rkt.input_indikator_kinerja = inputIndikatorKinerjas;
      }

      if (
        updateRktDto.output_indikator_kinerja &&
        updateRktDto.output_indikator_kinerja.length > 0
      ) {
        const outputIndikatorKinerjas =
          await this.indikatorKinerjaService.createMany(
            updateRktDto.output_indikator_kinerja,
          );
        rkt.output_indikator_kinerja = outputIndikatorKinerjas;
      }

      if (
        updateRktDto.outcome_indikator_kinerja &&
        updateRktDto.outcome_indikator_kinerja.length > 0
      ) {
        const outcomeIndikatorKinerjas =
          await this.indikatorKinerjaService.createMany(
            updateRktDto.outcome_indikator_kinerja,
          );
        rkt.outcome_indikator_kinerja = outcomeIndikatorKinerjas;
      }

      // Update properti lainnya
      await this.rktRepository.update(id, {
        name: updateRktDto.name,
        unit_id: updateRktDto.unit_id,
        label: updateRktDto.label,
        total_anggaran: updateRktDto.total_anggaran,
        renstra_id: updateRktDto.renstra_id,
      });

      const updatedRkt = await this.rktRepository.findOne({
        where: { id },
        relations: [
          'sub_kegiatan_id',
          'input_indikator_kinerja',
          'output_indikator_kinerja',
          'outcome_indikator_kinerja',
        ],
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RKT berhasil diperbarui',
        data: updatedRkt,
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
      const rkt = await this.rktRepository.findOne({
        where: { id },
      });

      if (!rkt) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `RKT dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.rktRepository.remove(rkt);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'RKT berhasil dihapus',
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

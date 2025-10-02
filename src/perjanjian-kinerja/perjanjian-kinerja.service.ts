import {
  Injectable,
  NotFoundException,
  HttpStatus,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePerjanjianKinerjaDto } from './dto/create-perjanjian-kinerja.dto';
import { UpdatePerjanjianKinerjaDto } from './dto/update-perjanjian-kinerja.dto';
import { PerjanjianKinerja } from './entities/perjanjian-kinerja.entity';
import { FilterPerjanjianKinerjaDto } from './dto/filter-perjanjian-kinerja.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import { decodeJwt } from '../common/utils/jwt.util';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class PerjanjianKinerjaService {
  constructor(
    @InjectRepository(PerjanjianKinerja)
    private perjanjianKinerjaRepository: Repository<PerjanjianKinerja>,
    private unitKerjaService: UnitKerjaService,
  ) {}

  async create(
    createPerjanjianKinerjaDto: CreatePerjanjianKinerjaDto,
    file: Express.Multer.File,
    token: string,
  ): Promise<ApiResponse> {
    try {
      // Verifikasi unit_id
      const unitResponse = await this.unitKerjaService.findById(
        Number(createPerjanjianKinerjaDto.unit_id),
        token,
      );

      if (!unitResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit dengan ID ${createPerjanjianKinerjaDto.unit_id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi unor_id
      const unorResponse = await this.unitKerjaService.findUnorById(
        Number(createPerjanjianKinerjaDto.unit_id),
        token,
        createPerjanjianKinerjaDto.unor_id,
      );

      if (!unorResponse.status) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unit Organisasi dengan ID ${createPerjanjianKinerjaDto.unor_id} tidak ditemukan`,
          data: null,
        };
      }

      const decodedToken = decodeJwt(token);
      const userId = decodedToken.sub;

      // Simpan file path jika ada file yang diupload
      let filePath: string | null = null;
      if (file) {
        filePath = file.path;
      }

      const perjanjianKinerja = this.perjanjianKinerjaRepository.create({
        ...createPerjanjianKinerjaDto,
        created_by: userId,
      });

      if (filePath) {
        perjanjianKinerja.file = filePath;
      }

      const result =
        await this.perjanjianKinerjaRepository.save(perjanjianKinerja);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Perjanjian kinerja berhasil dibuat',
        data: result,
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
    filterDto: FilterPerjanjianKinerjaDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const { page = 1, perPage = 10, unit_id, unor_id } = filterDto;

      const queryBuilder =
        this.perjanjianKinerjaRepository.createQueryBuilder(
          'perjanjian_kinerja',
        );

      if (unit_id) {
        queryBuilder.andWhere('perjanjian_kinerja.unit_id = :unit_id', {
          unit_id,
        });
      }

      if (unor_id) {
        queryBuilder.andWhere('perjanjian_kinerja.unor_id = :unor_id', {
          unor_id,
        });
      }

      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;

      queryBuilder.skip(offset).take(perPage);
      queryBuilder.orderBy('perjanjian_kinerja.created_at', 'DESC');

      const data = await queryBuilder.getMany();

      // Populate unit dan unor data
      const unitPromises = data.map((item) =>
        this.unitKerjaService.findById(Number(item.unit_id), token),
      );
      const unitResponses = await Promise.all(unitPromises);

      const unorPromises = data.map((item) =>
        this.unitKerjaService.findUnorById(
          Number(item.unit_id),
          token,
          item.unor_id,
        ),
      );
      const unorResponses = await Promise.all(unorPromises);

      const result = data.map((item, index) => ({
        ...item,
        unit: unitResponses[index].data,
        unor: unorResponses[index].data,
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
        message: 'Daftar perjanjian kinerja berhasil diambil',
        data: result,
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
      const perjanjianKinerja = await this.perjanjianKinerjaRepository.findOne({
        where: { id: +id },
      });

      if (!perjanjianKinerja) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Perjanjian kinerja dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Populate unit dan unor data
      const unitData = await this.unitKerjaService.findById(
        Number(perjanjianKinerja.unit_id),
        token,
      );
      const unorData = await this.unitKerjaService.findUnorById(
        Number(perjanjianKinerja.unit_id),
        token,
        perjanjianKinerja.unor_id,
      );

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Perjanjian kinerja berhasil diambil',
        data: {
          ...perjanjianKinerja,
          unit: unitData.data,
          unor: unorData.data,
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

  async update(
    id: string,
    updatePerjanjianKinerjaDto: UpdatePerjanjianKinerjaDto,
    file: Express.Multer.File,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const perjanjianKinerja = await this.perjanjianKinerjaRepository.findOne({
        where: { id: +id },
      });

      if (!perjanjianKinerja) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Perjanjian kinerja dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Verifikasi unit_id jika ada
      if (updatePerjanjianKinerjaDto.unit_id) {
        const unitResponse = await this.unitKerjaService.findById(
          Number(updatePerjanjianKinerjaDto.unit_id),
          token,
        );

        if (!unitResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit dengan ID ${updatePerjanjianKinerjaDto.unit_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      // Verifikasi unor_id jika ada
      if (updatePerjanjianKinerjaDto.unor_id) {
        const unitId =
          updatePerjanjianKinerjaDto.unit_id || perjanjianKinerja.unit_id;
        const unorResponse = await this.unitKerjaService.findUnorById(
          Number(unitId),
          token,
          updatePerjanjianKinerjaDto.unor_id,
        );

        if (!unorResponse.status) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: `Unit Organisasi dengan ID ${updatePerjanjianKinerjaDto.unor_id} tidak ditemukan`,
            data: null,
          };
        }
      }

      const decodedToken = decodeJwt(token);
      const userId = decodedToken.sub;

      // Update file path jika ada file yang diupload
      let updateData: any = {
        ...updatePerjanjianKinerjaDto,
        updated_by: userId,
      };
      if (file) {
        updateData.file = file.path;
      }

      await this.perjanjianKinerjaRepository.update(+id, updateData);

      const updated = await this.perjanjianKinerjaRepository.findOne({
        where: { id: +id },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Perjanjian kinerja berhasil diperbarui',
        data: updated,
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
      const perjanjianKinerja = await this.perjanjianKinerjaRepository.findOne({
        where: { id: +id },
      });

      if (!perjanjianKinerja) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Perjanjian kinerja dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.perjanjianKinerjaRepository.delete(+id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Perjanjian kinerja berhasil dihapus',
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

  async downloadFile(id: string): Promise<StreamableFile> {
    try {
      const perjanjianKinerja = await this.perjanjianKinerjaRepository.findOne({
        where: { id: Number(id) },
      });

      if (!perjanjianKinerja) {
        throw new NotFoundException(
          `Perjanjian Kinerja dengan ID ${id} tidak ditemukan`,
        );
      }

      if (!perjanjianKinerja.file) {
        throw new NotFoundException('File tidak ditemukan');
      }

      const filePath = join(
        process.cwd(),
        'uploads/perjanjian-kinerja',
        perjanjianKinerja.file,
      );

      if (!existsSync(filePath)) {
        throw new NotFoundException('File tidak ditemukan di server');
      }

      const file = createReadStream(filePath);
      return new StreamableFile(file);
    } catch (error) {
      throw error;
    }
  }

  async findBySkpId(skpId: string, token: string): Promise<ApiResponse> {
    try {
      const perjanjianKinerjaList = await this.perjanjianKinerjaRepository.find(
        {
          where: { skp_id: Number(skpId) },
        },
      );

      if (perjanjianKinerjaList.length === 0) {
        return {
          code: HttpStatus.OK,
          status: true,
          message: `Tidak ada Perjanjian Kinerja yang ditemukan untuk SKP ID ${skpId}`,
          data: [],
        };
      }

      // Tambahkan informasi unit kerja untuk setiap perjanjian kinerja
      const perjanjianKinerjaWithUnitPromises = perjanjianKinerjaList.map(
        async (perjanjianKinerja) => {
          const unitResponse = await this.unitKerjaService.findById(
            Number(perjanjianKinerja.unit_id),
            token,
          );

          const unorResponse = await this.unitKerjaService.findUnorById(
            Number(perjanjianKinerja.unit_id),
            token,
            perjanjianKinerja.unor_id,
          );

          return {
            ...perjanjianKinerja,
            unit: unitResponse.status ? unitResponse.data : null,
            unor: unorResponse.status ? unorResponse.data : null,
          };
        },
      );

      const perjanjianKinerjaWithUnit = await Promise.all(
        perjanjianKinerjaWithUnitPromises,
      );

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar Perjanjian Kinerja berhasil diambil',
        data: perjanjianKinerjaWithUnit,
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

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAspekDto } from './dto/create-aspek.dto';
import { UpdateAspekDto } from './dto/update-aspek.dto';
import { FilterAspekDto } from './dto/filter-aspek.dto';
import { Aspek } from './entities/aspek.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { IndikatorKinerjaService } from '../indikator-kinerja/indikator-kinerja.service';

@Injectable()
export class AspekService {
  constructor(
    @InjectRepository(Aspek)
    private readonly aspekRepository: Repository<Aspek>,
    private readonly indikatorKinerjaService: IndikatorKinerjaService,
  ) {}

  async create(createAspekDto: CreateAspekDto): Promise<ApiResponse> {
    try {
      // Buat objek aspek tanpa indikator kinerja terlebih dahulu
      const aspekData = { ...createAspekDto };
      delete aspekData.indikator_kinerja;
      
      // Buat aspek
      const aspek = this.aspekRepository.create(aspekData);
      
      // Jika ada indikator kinerja DTO, buat indikator kinerja
      if (createAspekDto.indikator_kinerja) {
        const indikatorKinerja = await this.indikatorKinerjaService.create(
          createAspekDto.indikator_kinerja
        );
        aspek.indikator_kinerja_id = indikatorKinerja.id;
        aspek.indikator_kinerja = indikatorKinerja;
      }
      
      const savedAspek = await this.aspekRepository.save(aspek);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Aspek berhasil dibuat',
        data: savedAspek,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal membuat aspek: ${error.message}`,
        data: null,
      };
    }
  }

  async findAll(filterDto: FilterAspekDto): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        rhk_id,
        jenis,
        desc,
        indikator_kinerja_id,
      } = filterDto;

      const queryBuilder = this.aspekRepository
        .createQueryBuilder('aspek')
        .leftJoinAndSelect('aspek.indikator_kinerja', 'indikator_kinerja');

      if (rhk_id) {
        queryBuilder.andWhere('aspek.rhk_id = :rhk_id', { rhk_id });
      }

      if (jenis) {
        queryBuilder.andWhere('aspek.jenis = :jenis', { jenis });
      }

      if (desc) {
        queryBuilder.andWhere('aspek.desc LIKE :desc', {
          desc: `%${desc}%`,
        });
      }

      if (indikator_kinerja_id) {
        queryBuilder.andWhere(
          'aspek.indikator_kinerja_id = :indikator_kinerja_id',
          { indikator_kinerja_id },
        );
      }

      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / perPage);
      const offset = (page - 1) * perPage;

      queryBuilder.skip(offset).take(perPage);
      queryBuilder.orderBy('aspek.created_at', 'DESC');

      const aspek = await queryBuilder.getMany();

      const pagination = {
        current_page: Number(page),
        per_page: Number(perPage),
        total: total,
        last_page: totalPages,
      };

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar aspek berhasil diambil',
        data: aspek,
        pagination,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mengambil daftar aspek: ${error.message}`,
        data: null,
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const aspek = await this.aspekRepository.findOne({
        where: { id },
        relations: ['indikator_kinerja'],
      });

      if (!aspek) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Aspek tidak ditemukan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Aspek berhasil diambil',
        data: aspek,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mengambil aspek: ${error.message}`,
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateAspekDto: UpdateAspekDto,
  ): Promise<ApiResponse> {
    try {
      const aspek = await this.aspekRepository.findOne({ 
        where: { id },
        relations: ['indikator_kinerja']
      });

      if (!aspek) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Aspek tidak ditemukan',
          data: null,
        };
      }

      // Tangani indikator kinerja DTO
      if (updateAspekDto.indikator_kinerja) {
        // Jika aspek sudah memiliki indikator kinerja, update
        if (aspek.indikator_kinerja_id) {
          await this.indikatorKinerjaService.update(
            aspek.indikator_kinerja_id,
            updateAspekDto.indikator_kinerja
          );
        } else {
          // Jika belum ada, buat baru
          const indikatorKinerja = await this.indikatorKinerjaService.create(
            updateAspekDto.indikator_kinerja
          );
          aspek.indikator_kinerja_id = indikatorKinerja.id;
          await this.aspekRepository.update(id, { 
            indikator_kinerja_id: indikatorKinerja.id 
          });
        }
      }

      // Update aspek tanpa indikator kinerja DTO
      const aspekData = { ...updateAspekDto };
      delete aspekData.indikator_kinerja;
      
      await this.aspekRepository.update(id, aspekData);
      
      const updatedAspek = await this.aspekRepository.findOne({
        where: { id },
        relations: ['indikator_kinerja'],
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Aspek berhasil diperbarui',
        data: updatedAspek,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal memperbarui aspek: ${error.message}`,
        data: null,
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const aspek = await this.aspekRepository.findOne({
        where: { id },
      });

      if (!aspek) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Aspek tidak ditemukan',
          data: null,
        };
      }

      await this.aspekRepository.remove(aspek);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Aspek berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal menghapus aspek: ${error.message}`,
        data: null,
      };
    }
  }

  async findByRhkId(rhkId: string): Promise<ApiResponse> {
    try {
      const aspek = await this.aspekRepository.find({
        where: { rhk_id: rhkId },
        relations: ['indikator_kinerja'],
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar aspek berhasil diambil',
        data: aspek,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mengambil daftar aspek: ${error.message}`,
        data: null,
      };
    }
  }
}

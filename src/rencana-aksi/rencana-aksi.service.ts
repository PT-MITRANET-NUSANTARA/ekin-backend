import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRencanaAksiDto } from './dto/create-rencana-aksi.dto';
import { UpdateRencanaAksiDto } from './dto/update-rencana-aksi.dto';
import { RencanaAksi } from './entities/rencana-aksi.entity';
import { FilterRencanaAksiDto } from './dto/filter-rencana-aksi.dto';

@Injectable()
export class RencanaAksiService {
  constructor(
    @InjectRepository(RencanaAksi)
    private rencanaAksiRepository: Repository<RencanaAksi>,
  ) {}

  async create(createRencanaAksiDto: CreateRencanaAksiDto) {
    const rencanaAksi = this.rencanaAksiRepository.create(createRencanaAksiDto);
    await this.rencanaAksiRepository.save(rencanaAksi);
    return {
      status: true,
      message: 'Rencana Aksi berhasil dibuat',
      data: rencanaAksi,
    };
  }

  async findAll(filter: FilterRencanaAksiDto) {
    const { page = 1, perPage = 10, ...rest } = filter;
    const skip = (page - 1) * perPage;
    const take = perPage;

    const queryBuilder =
      this.rencanaAksiRepository.createQueryBuilder('rencanaAksi');

    // Apply filters if provided
    if (rest.skp_id) {
      queryBuilder.andWhere('rencanaAksi.skp_id = :skp_id', {
        skp_id: rest.skp_id,
      });
    }
    if (rest.rhk_id) {
      queryBuilder.andWhere('rencanaAksi.rhk_id = :rhk_id', {
        rhk_id: rest.rhk_id,
      });
    }
    if (rest.periode_penilaian_id) {
      queryBuilder.andWhere(
        'rencanaAksi.periode_penilaian_id = :periode_penilaian_id',
        {
          periode_penilaian_id: rest.periode_penilaian_id,
        },
      );
    }
    if (rest.periode_start) {
      queryBuilder.andWhere('rencanaAksi.periode_start >= :periode_start', {
        periode_start: rest.periode_start,
      });
    }
    if (rest.periode_end) {
      queryBuilder.andWhere('rencanaAksi.periode_end <= :periode_end', {
        periode_end: rest.periode_end,
      });
    }
    if (rest.desc) {
      queryBuilder.andWhere('rencanaAksi.desc LIKE :desc', {
        desc: `%${rest.desc}%`,
      });
    }

    queryBuilder.skip(skip).take(take);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      status: true,
      message: 'Rencana Aksi berhasil ditemukan',
      data: {
        data,
        meta: {
          total,
          page,
          perPage,
          totalPages: Math.ceil(total / perPage),
        },
      },
    };
  }

  async findOne(id: string) {
    const rencanaAksi = await this.rencanaAksiRepository.findOne({
      where: { id },
    });
    if (!rencanaAksi) {
      throw new NotFoundException(
        `Rencana Aksi dengan ID ${id} tidak ditemukan`,
      );
    }
    return {
      status: true,
      message: 'Rencana Aksi berhasil ditemukan',
      data: rencanaAksi,
    };
  }

  async findBySkpId(skpId: string) {
    const rencanaAksi = await this.rencanaAksiRepository.find({
      where: { skp_id: skpId },
    });
    return {
      status: true,
      message: 'Rencana Aksi berhasil ditemukan',
      data: rencanaAksi,
    };
  }

  async update(id: string, updateRencanaAksiDto: UpdateRencanaAksiDto) {
    const rencanaAksi = await this.rencanaAksiRepository.findOne({
      where: { id },
    });
    if (!rencanaAksi) {
      throw new NotFoundException(
        `Rencana Aksi dengan ID ${id} tidak ditemukan`,
      );
    }
    await this.rencanaAksiRepository.update(id, updateRencanaAksiDto);
    const updatedRencanaAksi = await this.rencanaAksiRepository.findOne({
      where: { id },
    });
    return {
      status: true,
      message: 'Rencana Aksi berhasil diperbarui',
      data: updatedRencanaAksi,
    };
  }

  async remove(id: string) {
    const rencanaAksi = await this.rencanaAksiRepository.findOne({
      where: { id },
    });
    if (!rencanaAksi) {
      throw new NotFoundException(
        `Rencana Aksi dengan ID ${id} tidak ditemukan`,
      );
    }
    await this.rencanaAksiRepository.delete(id);
    return {
      status: true,
      message: 'Rencana Aksi berhasil dihapus',
      data: null,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIndikatorKinerjaDto } from './dto/create-indikator-kinerja.dto';
import { UpdateIndikatorKinerjaDto } from './dto/update-indikator-kinerja.dto';
import { IndikatorKinerja } from './entities/indikator-kinerja.entity';

@Injectable()
export class IndikatorKinerjaService {
  constructor(
    @InjectRepository(IndikatorKinerja)
    private indikatorKinerjaRepository: Repository<IndikatorKinerja>,
  ) {}

  create(createIndikatorKinerjaDto: CreateIndikatorKinerjaDto) {
    const indikatorKinerja = this.indikatorKinerjaRepository.create(
      createIndikatorKinerjaDto,
    );
    return this.indikatorKinerjaRepository.save(indikatorKinerja);
  }

  createMany(createIndikatorKinerjaDtos: CreateIndikatorKinerjaDto[]) {
    const indikatorKinerjas = this.indikatorKinerjaRepository.create(
      createIndikatorKinerjaDtos,
    );
    return this.indikatorKinerjaRepository.save(indikatorKinerjas);
  }

  findAll() {
    return this.indikatorKinerjaRepository.find();
  }

  findOne(id: string) {
    return this.indikatorKinerjaRepository.findOneBy({ id });
  }

  findByIds(ids: string[]) {
    return this.indikatorKinerjaRepository.findByIds(ids);
  }

  async update(
    id: string,
    updateIndikatorKinerjaDto: UpdateIndikatorKinerjaDto,
  ) {
    await this.indikatorKinerjaRepository.update(id, updateIndikatorKinerjaDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const indikatorKinerja = await this.findOne(id);
    if (!indikatorKinerja) {
      return null;
    }
    return this.indikatorKinerjaRepository.remove(indikatorKinerja);
  }
}

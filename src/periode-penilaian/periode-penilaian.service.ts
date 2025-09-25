import { Injectable } from '@nestjs/common';
import { CreatePeriodePenilaianDto } from './dto/create-periode-penilaian.dto';
import { UpdatePeriodePenilaianDto } from './dto/update-periode-penilaian.dto';

@Injectable()
export class PeriodePenilaianService {
  create(createPeriodePenilaianDto: CreatePeriodePenilaianDto) {
    return 'This action adds a new periodePenilaian';
  }

  findAll() {
    return `This action returns all periodePenilaian`;
  }

  findOne(id: number) {
    return `This action returns a #${id} periodePenilaian`;
  }

  update(id: number, updatePeriodePenilaianDto: UpdatePeriodePenilaianDto) {
    return `This action updates a #${id} periodePenilaian`;
  }

  remove(id: number) {
    return `This action removes a #${id} periodePenilaian`;
  }
}

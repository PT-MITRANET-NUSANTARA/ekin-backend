import { PartialType } from '@nestjs/mapped-types';
import { CreateTujuanDto } from './create-tujuan.dto';
import { CreateIndikatorKinerjaDto } from '../../indikator-kinerja/dto/create-indikator-kinerja.dto';

export class UpdateTujuanDto extends PartialType(CreateTujuanDto) {
  name?: string;
  renstra_id?: string;
  unit_id?: string;
  indikator_kinerja?: CreateIndikatorKinerjaDto[];
}

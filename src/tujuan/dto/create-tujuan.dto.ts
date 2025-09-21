import { CreateIndikatorKinerjaDto } from '../../indikator-kinerja/dto/create-indikator-kinerja.dto';

export class CreateTujuanDto {
  name: string;
  renstra_id: string;
  unit_id: string;
  indikator_kinerja: CreateIndikatorKinerjaDto[];
}

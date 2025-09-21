import { PartialType } from '@nestjs/mapped-types';
import { CreateIndikatorKinerjaDto } from './create-indikator-kinerja.dto';

export class UpdateIndikatorKinerjaDto extends PartialType(
  CreateIndikatorKinerjaDto,
) {}

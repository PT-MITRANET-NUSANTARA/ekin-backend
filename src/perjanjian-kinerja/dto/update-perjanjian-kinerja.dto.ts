import { PartialType } from '@nestjs/mapped-types';
import { CreatePerjanjianKinerjaDto } from './create-perjanjian-kinerja.dto';

export class UpdatePerjanjianKinerjaDto extends PartialType(
  CreatePerjanjianKinerjaDto,
) {}

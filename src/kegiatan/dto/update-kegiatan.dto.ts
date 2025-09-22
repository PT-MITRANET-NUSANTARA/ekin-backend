import { PartialType } from '@nestjs/mapped-types';
import { CreateKegiatanDto } from './create-kegiatan.dto';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateKegiatanDto extends PartialType(CreateKegiatanDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  unit_id?: string;

  @IsOptional()
  @IsNumber()
  total_anggaran?: number;

  @IsOptional()
  @IsString()
  program_id?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  indikator_kinerja?: any[];
}

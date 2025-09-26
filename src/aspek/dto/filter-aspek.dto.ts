import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { JenisAspek } from '../entities/aspek.entity';

export class FilterAspekDto {
  @IsOptional()
  @IsString()
  rhk_id?: string;

  @IsOptional()
  @IsEnum(JenisAspek)
  jenis?: JenisAspek;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  indikator_kinerja_id?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  perPage?: number = 10;
}

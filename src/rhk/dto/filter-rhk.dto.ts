import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { JenisRhk, KlasifikasiRhk } from '../entities/rhk.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterRhkDto extends PaginationDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  skp_id?: number;

  @IsEnum(JenisRhk)
  @IsOptional()
  jenis?: JenisRhk;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rhk_atasan_id?: number;

  @IsEnum(KlasifikasiRhk)
  @IsOptional()
  klasifikasi?: KlasifikasiRhk;
}

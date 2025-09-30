import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SkpPendekatan, SkpStatus } from '../entities/skp.entity';

export class FilterSkpDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  unit_id?: string;

  @IsOptional()
  @IsString()
  renstra_id?: string;

  @IsOptional()
  @IsEnum(SkpStatus)
  status?: SkpStatus;

  @IsOptional()
  @IsEnum(SkpPendekatan)
  pendekatan?: SkpPendekatan;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  perPage?: number = 10;
}

import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDate,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSettingDto {
  @IsNotEmpty()
  @IsString()
  admin_id: string;

  @IsNotEmpty()
  @Type(() => Date)
  default_harian_time_start: Date;

  @IsNotEmpty()
  @Type(() => Date)
  default_harian_time_end: Date;

  @IsNotEmpty()
  @Type(() => Date)
  default_break_time_start: Date;

  @IsNotEmpty()
  @Type(() => Date)
  default_break_time_end: Date;

  @IsNotEmpty()
  @IsNumber()
  default_total_minuetes: number;

  @IsOptional()
  @IsString()
  bupati_id: string;

  @IsOptional()
  @IsArray()
  default_work_days?: string[];
}

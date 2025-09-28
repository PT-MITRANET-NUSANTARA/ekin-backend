import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { CreateHarianDto } from './create-harian.dto';

export class UpdateHarianDto extends PartialType(CreateHarianDto) {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsInt()
  skp_id?: number;

  @IsOptional()
  @IsBoolean()
  is_skp?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date_time?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date_time?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  tautan?: string;

  @IsOptional()
  @IsArray()
  files?: string[];

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  rencana_aksi_ids?: string[];
}

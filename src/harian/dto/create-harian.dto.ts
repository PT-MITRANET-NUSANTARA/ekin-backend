import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateHarianDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsString()
  skp_id: string;
  
  @IsOptional()
  @IsString()
  rhk_id: string;

  @IsNotEmpty()
  @IsBoolean()
  is_skp: boolean;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  start_date_time: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  end_date_time: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsOptional()
  @IsString()
  tautan: string;

  @IsOptional()
  @IsArray()
  files: string[];

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  rencana_aksi_ids: string[];
}

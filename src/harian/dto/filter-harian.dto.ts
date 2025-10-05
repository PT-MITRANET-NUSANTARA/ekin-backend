import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FilterHarianDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  perPage?: number = 10;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsString()
  skp_id?: string;
  
  @IsOptional()
  @IsString()
  rhk_id?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_skp?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  rencana_aksi_id?: string;
  
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date_time?: Date;
  
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date_time?: Date;
}

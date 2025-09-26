import {
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRencanaAksiDto {
  @IsOptional()
  @IsUUID()
  skp_id?: string;

  @IsOptional()
  @IsUUID()
  rhk_id?: string;

  @IsOptional()
  @IsUUID()
  periode_penilaian_id?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  periode_start?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  periode_end?: Date;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  perPage?: number = 10;
}

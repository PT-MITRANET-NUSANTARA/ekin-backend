import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RktLabel } from '../entities/rkt.entity';

export class FilterRktDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  unit_id?: string;

  @IsOptional()
  @IsString()
  renstra_id?: string;

  @IsOptional()
  @IsEnum(RktLabel)
  label?: RktLabel;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  perPage?: number = 10;
}

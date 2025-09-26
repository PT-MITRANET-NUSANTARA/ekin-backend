import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPerilakuDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  skp_id?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  perPage?: number = 10;
}

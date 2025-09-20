import {
  IsOptional,
  IsString,
  IsDateString,
  Min,
  IsInt,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class FilterRenstraDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  periode_start?: string;

  @IsOptional()
  @IsDateString()
  periode_end?: string;

  @IsOptional()
  @IsString()
  unit_id?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  @IsArray()
  misi_ids?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number = 10;
}

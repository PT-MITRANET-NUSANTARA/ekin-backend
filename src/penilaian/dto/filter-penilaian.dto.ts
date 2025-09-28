import { IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPenilaianDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perPage?: number = 10;

  @IsOptional()
  @IsUUID()
  skp_dinilai_id?: string;

  @IsOptional()
  @IsUUID()
  skp_penilai_id?: string;

  @IsOptional()
  @IsUUID()
  periode_penilaian_id?: string;
}

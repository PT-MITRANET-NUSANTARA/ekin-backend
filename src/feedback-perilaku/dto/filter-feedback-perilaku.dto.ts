import { IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterFeedbackPerilakuDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  perPage?: number;

  @IsOptional()
  @IsUUID()
  perilaku_id?: string;

  @IsOptional()
  @IsUUID()
  periode_penilaian_id?: string;
}

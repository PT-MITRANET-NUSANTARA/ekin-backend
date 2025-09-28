import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreatePenilaianDto {
  @IsNotEmpty()
  @IsUUID()
  skp_dinilai_id: string;

  @IsNotEmpty()
  @IsUUID()
  skp_penilai_id: string;

  @IsNotEmpty()
  @IsUUID()
  periode_penilaian_id: string;

  @IsOptional()
  @IsNumber()
  rating_kinerja?: number;

  @IsOptional()
  @IsNumber()
  rating_perilaku?: number;

  @IsOptional()
  @IsNumber()
  rating_predikat?: number;
}

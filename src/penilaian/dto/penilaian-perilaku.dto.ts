import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class PenilaianPerilakuDto {
  @IsNotEmpty()
  @IsUUID()
  skp_dinilai_id: string;

  @IsNotEmpty()
  @IsUUID()
  skp_penilai_id: string;

  @IsNotEmpty()
  @IsUUID()
  periode_penilaian_id: string;

  @IsNotEmpty()
  @IsNumber()
  rating_perilaku: number;
}

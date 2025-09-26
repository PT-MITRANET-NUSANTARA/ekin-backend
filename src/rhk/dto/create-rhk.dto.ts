import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { JenisRhk, KlasifikasiRhk } from '../entities/rhk.entity';

export class CreateRhkDto {
  @IsNumber()
  skp_id: number;

  @IsString()
  desc: string;

  @IsEnum(JenisRhk)
  jenis: JenisRhk;

  @IsNumber()
  @IsOptional()
  rhk_atasan_id?: number;

  @IsEnum(KlasifikasiRhk)
  klasifikasi: KlasifikasiRhk;

  @IsString()
  @IsOptional()
  penugasan?: string;

  @IsNumber()
  @IsOptional()
  rkts_id?: number;
}

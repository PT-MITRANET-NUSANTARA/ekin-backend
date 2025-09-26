import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { JenisRhk, KlasifikasiRhk } from '../entities/rhk.entity';

export class CreateRhkDto {
  @IsNumber()
  skp_id: number;

  @IsString()
  desc: string;

  @IsEnum(JenisRhk)
  jenis: JenisRhk;

  @IsString()
  @IsOptional()
  rhk_atasan_id?: string;

  @IsEnum(KlasifikasiRhk)
  klasifikasi: KlasifikasiRhk;

  @IsString()
  @IsOptional()
  penugasan?: string;

  @IsNumber()
  @IsOptional()
  rkts_id?: number;
}

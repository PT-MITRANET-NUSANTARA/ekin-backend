import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { JenisRhk, KlasifikasiRhk } from '../entities/rhk.entity';

export class CreateRhkDto {
  @IsUUID()
  @IsNotEmpty()
  skp_id: string;

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

  @IsArray()
  @IsOptional()
  realisasi?: Record<string, string>[];

  @IsArray()
  @IsOptional()
  rkts_id?: string[];
}

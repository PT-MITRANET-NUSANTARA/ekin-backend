import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SkpCascading, SkpPendekatan, SkpStatus } from '../entities/skp.entity';

class LampiranDto {
  @IsOptional()
  @IsString({ each: true })
  sumber_daya?: string[];

  @IsOptional()
  @IsString({ each: true })
  skema?: string[];

  @IsOptional()
  @IsString({ each: true })
  konsekuensi?: string[];
}

export class CreateSkpDto {
  @IsNotEmpty({ message: 'Tanggal mulai periode tidak boleh kosong' })
  @IsDateString()
  periode_start: string;

  @IsNotEmpty({ message: 'Tanggal akhir periode tidak boleh kosong' })
  @IsDateString()
  periode_end: string;

  @IsOptional()
  @IsEnum(SkpStatus, { message: 'Status tidak valid' })
  status?: SkpStatus;

  @IsOptional()
  @IsEnum(SkpPendekatan, { message: 'Pendekatan tidak valid' })
  pendekatan?: SkpPendekatan;

  @IsOptional()
  @IsEnum(SkpCascading, { message: 'Cascading tidak valid' })
  cascading?: SkpCascading;

  @IsOptional()
  @ValidateNested()
  @Type(() => LampiranDto)
  lampiran?: LampiranDto;

  @IsNotEmpty({ message: 'User ID tidak boleh kosong' })
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  atasan_skp_id?: string;

  @IsOptional()
  posjab?: object[];

  @IsNotEmpty({ message: 'Unit ID tidak boleh kosong' })
  @IsOptional()
  unit_id?: string;
}

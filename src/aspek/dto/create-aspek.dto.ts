import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { JenisAspek } from '../entities/aspek.entity';

export class CreateAspekDto {
  @IsUUID()
  @IsNotEmpty()
  rhk_id: string;

  @IsEnum(JenisAspek)
  @IsNotEmpty()
  jenis: JenisAspek;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsUUID()
  @IsOptional()
  indikator_kinerja_id?: string;
}

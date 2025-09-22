import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIndikatorKinerjaDto } from '../../indikator-kinerja/dto/create-indikator-kinerja.dto';

export class CreateKegiatanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  unit_id: string;

  @IsNotEmpty()
  @IsNumber()
  total_anggaran: number;

  @IsNotEmpty()
  @IsUUID()
  program_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndikatorKinerjaDto)
  indikator_kinerja: CreateIndikatorKinerjaDto[];
}

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIndikatorKinerjaDto } from '../../indikator-kinerja/dto/create-indikator-kinerja.dto';
import { RktLabel } from '../entities/rkt.entity';

export class CreateRktDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  unit_id: string;

  @IsNotEmpty()
  @IsEnum(RktLabel)
  label: RktLabel;

  @IsNotEmpty()
  @IsNumber()
  total_anggaran: number;

  @IsNotEmpty()
  @IsString()
  renstra_id: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  sub_kegiatan_id: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndikatorKinerjaDto)
  input_indikator_kinerja: CreateIndikatorKinerjaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndikatorKinerjaDto)
  output_indikator_kinerja: CreateIndikatorKinerjaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndikatorKinerjaDto)
  outcome_indikator_kinerja: CreateIndikatorKinerjaDto[];
}

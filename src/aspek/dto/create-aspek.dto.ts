import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JenisAspek } from '../entities/aspek.entity';
import { CreateIndikatorKinerjaDto } from '../../indikator-kinerja/dto/create-indikator-kinerja.dto';

export class CreateAspekDto {
  @IsUUID()
  @IsNotEmpty()
  rhk_id: string;

  @IsEnum(JenisAspek)
  @IsNotEmpty()
  jenis: JenisAspek;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateIndikatorKinerjaDto)
  indikator_kinerja?: CreateIndikatorKinerjaDto;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramDto } from './create-program.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIndikatorKinerjaDto } from '../../indikator-kinerja/dto/create-indikator-kinerja.dto';

export class UpdateProgramDto extends PartialType(CreateProgramDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndikatorKinerjaDto)
  indikator_kinerja?: CreateIndikatorKinerjaDto[];
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateUmpegDto } from './create-umpeg.dto';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateUmpegDto extends PartialType(CreateUmpegDto) {
  @IsOptional()
  @IsString()
  unit_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jabatan?: string[];
}

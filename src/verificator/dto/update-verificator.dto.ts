import { PartialType } from '@nestjs/mapped-types';
import { CreateVerificatorDto } from './create-verificator.dto';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateVerificatorDto extends PartialType(CreateVerificatorDto) {
  @IsString()
  @IsOptional()
  unit_id?: string;

  @IsObject()
  @IsOptional()
  jabatan?: Record<string, string[]>;
}

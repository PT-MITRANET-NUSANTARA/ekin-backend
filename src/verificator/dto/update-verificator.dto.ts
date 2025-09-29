import { PartialType } from '@nestjs/mapped-types';
import { CreateVerificatorDto } from './create-verificator.dto';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVerificatorDto extends PartialType(CreateVerificatorDto) {
  @IsString()
  @IsOptional()
  unit_id?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  jabatan?: Array<Record<string, string[]>>;
}

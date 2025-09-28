import {
  IsNotEmpty,
  IsString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVerificatorDto {
  @IsString()
  @IsNotEmpty()
  unit_id: string;

  @IsObject()
  @IsNotEmpty()
  jabatan: Record<string, string[]>;
}

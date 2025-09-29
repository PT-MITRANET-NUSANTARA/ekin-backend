import { IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyUnitJabatanDto {
  @IsNotEmpty()
  @IsNumber()
  unit_id: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  jabatan: Array<Record<string, string[]>>;
}

import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRenstraDto {
  @IsNotEmpty()
  @IsDateString()
  periode_start: string;

  @IsNotEmpty()
  @IsDateString()
  periode_end: string;

  @IsNotEmpty()
  @IsString()
  unit_id: string;

  @IsArray()
  @IsString({ each: true })
  misi_ids: string[];
}

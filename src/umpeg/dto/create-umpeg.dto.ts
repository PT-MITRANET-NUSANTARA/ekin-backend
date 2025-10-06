import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateUmpegDto {
  @IsNotEmpty()
  @IsString()
  unit_id: string;

  @IsArray()
  @IsString()
  jabatan: string[];
}

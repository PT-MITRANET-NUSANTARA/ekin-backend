import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePerilakuDto {
  @IsNotEmpty()
  @IsString()
  skp_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  content: string[];

  @IsNotEmpty()
  @IsString()
  ekspetasi: string;
}

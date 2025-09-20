import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateMisiDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  desc: string;

  @IsNotEmpty()
  @IsUUID()
  visi_id: string;
}

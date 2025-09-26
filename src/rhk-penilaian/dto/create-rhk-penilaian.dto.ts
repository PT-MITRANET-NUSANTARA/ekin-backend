import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRhkPenilaianDto {
  @IsString()
  @IsNotEmpty()
  rhk_id: string;

  @IsString()
  @IsNotEmpty()
  skp_id: string;

  @IsString()
  @IsNotEmpty()
  periode_penilaian_id: string;
}
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRencanaAksiDto {
  @IsNotEmpty()
  @IsUUID()
  skp_id: string;

  @IsNotEmpty()
  @IsUUID()
  rhk_id: string;

  @IsNotEmpty()
  @IsUUID()
  periode_penilaian_id: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  periode_start: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  periode_end: Date;

  @IsNotEmpty()
  @IsString()
  desc: string;
}

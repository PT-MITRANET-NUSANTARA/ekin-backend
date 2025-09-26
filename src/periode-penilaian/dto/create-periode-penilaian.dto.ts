import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreatePeriodePenilaianDto {
  @IsNotEmpty()
  @IsDateString()
  periode_start: Date;

  @IsNotEmpty()
  @IsDateString()
  periode_end: Date;

  @IsNotEmpty()
  @IsString()
  unit_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
  
  @IsOptional()
  @IsUUID()
  renstra_id?: string;
}

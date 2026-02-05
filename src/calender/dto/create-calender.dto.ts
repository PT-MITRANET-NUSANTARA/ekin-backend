import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCalenderDto {
  @IsNotEmpty()
  @IsString()
  unit_id: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsBoolean()
  is_holiday: boolean;

  @IsOptional()
  @IsString()
  holiday_name?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  harian_time_start?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  harian_time_end?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  break_time_start?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  break_time_end?: Date;

  @IsOptional()
  @IsNumber()
  total_minutes?: number;
}

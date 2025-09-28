import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AbsenceStatus } from '../entities/absence.entity';
import { Type } from 'class-transformer';

export class CreateAbsenceDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsEnum(AbsenceStatus)
  status: AbsenceStatus;

  @IsNotEmpty()
  @IsUUID()
  unit_id: string;

  @IsOptional()
  @IsString()
  desc?: string;
}

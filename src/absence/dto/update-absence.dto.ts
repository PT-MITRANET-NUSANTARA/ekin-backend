import { PartialType } from '@nestjs/mapped-types';
import { CreateAbsenceDto } from './create-absence.dto';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AbsenceStatus } from '../entities/absence.entity';
import { Type } from 'class-transformer';

export class UpdateAbsenceDto extends PartialType(CreateAbsenceDto) {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsEnum(AbsenceStatus)
  status?: AbsenceStatus;

  @IsOptional()
  @IsUUID()
  unit_id?: string;

  @IsOptional()
  @IsString()
  desc?: string;
}

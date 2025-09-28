import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OperationType } from '../entities/log.entity';

export class CreateLogDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  model_id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsEnum(OperationType)
  operation: OperationType;
}

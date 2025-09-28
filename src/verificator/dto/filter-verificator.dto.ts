import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterVerificatorDto extends PaginationDto {
  @IsString()
  @IsOptional()
  unit_id?: string;
}

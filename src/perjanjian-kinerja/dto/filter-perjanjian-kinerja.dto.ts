import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterPerjanjianKinerjaDto extends PaginationDto {
  @IsOptional()
  @IsString()
  unit_id?: string;

  @IsOptional()
  @IsString()
  unor_id?: string;
}

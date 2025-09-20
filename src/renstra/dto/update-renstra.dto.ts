import { PartialType } from '@nestjs/mapped-types';
import { CreateRenstraDto } from './create-renstra.dto';

export class UpdateRenstraDto extends PartialType(CreateRenstraDto) {}

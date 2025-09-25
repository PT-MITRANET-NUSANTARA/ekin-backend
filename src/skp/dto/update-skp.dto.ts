import { PartialType } from '@nestjs/mapped-types';
import { CreateSkpDto } from './create-skp.dto';

export class UpdateSkpDto extends PartialType(CreateSkpDto) {}

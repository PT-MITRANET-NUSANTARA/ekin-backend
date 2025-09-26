import { PartialType } from '@nestjs/mapped-types';
import { CreateRhkDto } from './create-rhk.dto';

export class UpdateRhkDto extends PartialType(CreateRhkDto) {}

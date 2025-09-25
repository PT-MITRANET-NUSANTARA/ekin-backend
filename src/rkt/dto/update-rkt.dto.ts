import { PartialType } from '@nestjs/mapped-types';
import { CreateRktDto } from './create-rkt.dto';

export class UpdateRktDto extends PartialType(CreateRktDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateAspekDto } from './create-aspek.dto';

export class UpdateAspekDto extends PartialType(CreateAspekDto) {}

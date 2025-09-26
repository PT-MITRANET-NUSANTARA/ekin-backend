import { PartialType } from '@nestjs/mapped-types';
import { CreatePerilakuDto } from './create-perilaku.dto';

export class UpdatePerilakuDto extends PartialType(CreatePerilakuDto) {}

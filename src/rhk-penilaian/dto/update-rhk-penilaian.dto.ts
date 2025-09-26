import { PartialType } from '@nestjs/mapped-types';
import { CreateRhkPenilaianDto } from './create-rhk-penilaian.dto';

export class UpdateRhkPenilaianDto extends PartialType(CreateRhkPenilaianDto) {}

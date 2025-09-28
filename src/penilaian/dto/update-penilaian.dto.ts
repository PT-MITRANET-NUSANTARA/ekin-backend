import { PartialType } from '@nestjs/mapped-types';
import { CreatePenilaianDto } from './create-penilaian.dto';

export class UpdatePenilaianDto extends PartialType(CreatePenilaianDto) {}

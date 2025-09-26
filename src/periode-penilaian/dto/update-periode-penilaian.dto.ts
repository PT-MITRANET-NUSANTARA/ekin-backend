import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodePenilaianDto } from './create-periode-penilaian.dto';

export class UpdatePeriodePenilaianDto extends PartialType(CreatePeriodePenilaianDto) {}

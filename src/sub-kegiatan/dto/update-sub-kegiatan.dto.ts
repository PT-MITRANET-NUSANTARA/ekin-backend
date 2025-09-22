import { PartialType } from '@nestjs/mapped-types';
import { CreateSubKegiatanDto } from './create-sub-kegiatan.dto';

export class UpdateSubKegiatanDto extends PartialType(CreateSubKegiatanDto) {}

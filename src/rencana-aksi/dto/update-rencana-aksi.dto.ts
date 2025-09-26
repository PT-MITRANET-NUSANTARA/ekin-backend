import { PartialType } from '@nestjs/mapped-types';
import { CreateRencanaAksiDto } from './create-rencana-aksi.dto';

export class UpdateRencanaAksiDto extends PartialType(CreateRencanaAksiDto) {}

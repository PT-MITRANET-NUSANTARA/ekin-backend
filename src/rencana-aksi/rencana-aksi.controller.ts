import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RencanaAksiService } from './rencana-aksi.service';
import { CreateRencanaAksiDto } from './dto/create-rencana-aksi.dto';
import { UpdateRencanaAksiDto } from './dto/update-rencana-aksi.dto';
import { FilterRencanaAksiDto } from './dto/filter-rencana-aksi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rencana-aksi')
export class RencanaAksiController {
  constructor(private readonly rencanaAksiService: RencanaAksiService) {}

  @Post()
  create(@Body() createRencanaAksiDto: CreateRencanaAksiDto) {
    return this.rencanaAksiService.create(createRencanaAksiDto);
  }

  @Get()
  findAll(@Query() filter: FilterRencanaAksiDto) {
    return this.rencanaAksiService.findAll(filter);
  }

  @Get('skp/:skpId')
  findBySkpId(@Param('skpId') skpId: string) {
    return this.rencanaAksiService.findBySkpId(skpId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rencanaAksiService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRencanaAksiDto: UpdateRencanaAksiDto,
  ) {
    return this.rencanaAksiService.update(id, updateRencanaAksiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rencanaAksiService.remove(id);
  }
}

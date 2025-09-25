import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PeriodePenilaianService } from './periode-penilaian.service';
import { CreatePeriodePenilaianDto } from './dto/create-periode-penilaian.dto';
import { UpdatePeriodePenilaianDto } from './dto/update-periode-penilaian.dto';

@Controller('periode-penilaian')
export class PeriodePenilaianController {
  constructor(
    private readonly periodePenilaianService: PeriodePenilaianService,
  ) {}

  @Post()
  create(@Body() createPeriodePenilaianDto: CreatePeriodePenilaianDto) {
    return this.periodePenilaianService.create(createPeriodePenilaianDto);
  }

  @Get()
  findAll() {
    return this.periodePenilaianService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodePenilaianService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePeriodePenilaianDto: UpdatePeriodePenilaianDto,
  ) {
    return this.periodePenilaianService.update(+id, updatePeriodePenilaianDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.periodePenilaianService.remove(+id);
  }
}

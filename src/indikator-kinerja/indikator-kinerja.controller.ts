import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IndikatorKinerjaService } from './indikator-kinerja.service';
import { CreateIndikatorKinerjaDto } from './dto/create-indikator-kinerja.dto';
import { UpdateIndikatorKinerjaDto } from './dto/update-indikator-kinerja.dto';

@Controller('indikator-kinerja')
export class IndikatorKinerjaController {
  constructor(
    private readonly indikatorKinerjaService: IndikatorKinerjaService,
  ) {}

  @Post()
  create(@Body() createIndikatorKinerjaDto: CreateIndikatorKinerjaDto) {
    return this.indikatorKinerjaService.create(createIndikatorKinerjaDto);
  }

  @Get()
  findAll() {
    return this.indikatorKinerjaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.indikatorKinerjaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIndikatorKinerjaDto: UpdateIndikatorKinerjaDto,
  ) {
    return this.indikatorKinerjaService.update(id, updateIndikatorKinerjaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.indikatorKinerjaService.remove(id);
  }
}

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
  Headers,
} from '@nestjs/common';
import { SubKegiatanService } from './sub-kegiatan.service';
import { CreateSubKegiatanDto } from './dto/create-sub-kegiatan.dto';
import { UpdateSubKegiatanDto } from './dto/update-sub-kegiatan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sub-kegiatan')
@UseGuards(JwtAuthGuard)
export class SubKegiatanController {
  constructor(private readonly subKegiatanService: SubKegiatanService) {}

  @Post()
  create(
    @Body() createSubKegiatanDto: CreateSubKegiatanDto,
    @Headers('authorization') token: string,
  ) {
    return this.subKegiatanService.create(
      createSubKegiatanDto,
      token.split(' ')[1],
    );
  }

  @Get()
  findAll(@Query() filterDto: any, @Headers('authorization') token: string) {
    return this.subKegiatanService.findAll(filterDto, token.split(' ')[1]);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('authorization') token: string) {
    return this.subKegiatanService.findOne(id, token.split(' ')[1]);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubKegiatanDto: UpdateSubKegiatanDto,
    @Headers('authorization') token: string,
  ) {
    return this.subKegiatanService.update(
      id,
      updateSubKegiatanDto,
      token.split(' ')[1],
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') token: string) {
    return this.subKegiatanService.remove(id, token.split(' ')[1]);
  }
}

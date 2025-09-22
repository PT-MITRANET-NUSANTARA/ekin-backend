import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Headers,
  Query,
} from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { CreateKegiatanDto } from './dto/create-kegiatan.dto';
import { UpdateKegiatanDto } from './dto/update-kegiatan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('kegiatan')
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  @Post()
  create(
    @Body() createKegiatanDto: CreateKegiatanDto,
    @Headers('authorization') token: string,
  ) {
    return this.kegiatanService.create(createKegiatanDto, token.split(' ')[1]);
  }

  @Get()
  findAll(@Query() filterDto: any, @Headers('authorization') token: string) {
    return this.kegiatanService.findAll(filterDto, token.split(' ')[1]);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('authorization') token: string) {
    return this.kegiatanService.findOne(id, token.split(' ')[1]);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKegiatanDto: UpdateKegiatanDto,
    @Headers('authorization') token: string,
  ) {
    return this.kegiatanService.update(
      id,
      updateKegiatanDto,
      token.split(' ')[1],
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') token: string) {
    return this.kegiatanService.remove(id, token.split(' ')[1]);
  }
}

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
import { TujuanService } from './tujuan.service';
import { CreateTujuanDto } from './dto/create-tujuan.dto';
import { UpdateTujuanDto } from './dto/update-tujuan.dto';
import { FilterTujuanDto } from './dto/filter-tujuan.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tujuan')
@UseGuards(JwtAuthGuard)
export class TujuanController {
  constructor(private readonly tujuanService: TujuanService) {}

  @Post()
  async create(
    @Body() createTujuanDto: CreateTujuanDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.tujuanService.create(createTujuanDto, token);
  }

  @Get()
  async findAll(
    @Query() filterTujuanDto: FilterTujuanDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.tujuanService.findAll(filterTujuanDto, token);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.tujuanService.findOne(id, token);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTujuanDto: UpdateTujuanDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.tujuanService.update(id, updateTujuanDto, token);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.tujuanService.remove(id, token);
  }
}

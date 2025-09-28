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
import { UmpegService } from './umpeg.service';
import { CreateUmpegDto } from './dto/create-umpeg.dto';
import { UpdateUmpegDto } from './dto/update-umpeg.dto';
import { FilterUmpegDto } from './dto/filter-umpeg.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('umpeg')
@UseGuards(JwtAuthGuard)
export class UmpegController {
  constructor(private readonly umpegService: UmpegService) {}

  @Post()
  create(
    @Body() createUmpegDto: CreateUmpegDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.umpegService.create(createUmpegDto, token);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterUmpegDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.umpegService.findAll(filterDto, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.umpegService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUmpegDto: UpdateUmpegDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.umpegService.update(id, updateUmpegDto, token);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse> {
    return this.umpegService.remove(id);
  }
}

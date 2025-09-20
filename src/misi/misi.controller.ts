import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MisiService } from './misi.service';
import { CreateMisiDto } from './dto/create-misi.dto';
import { UpdateMisiDto } from './dto/update-misi.dto';
import { FilterMisiDto } from './dto/filter-misi.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('misi')
@UseGuards(JwtAuthGuard)
export class MisiController {
  constructor(private readonly misiService: MisiService) {}

  @Post()
  async create(@Body() createMisiDto: CreateMisiDto): Promise<ApiResponse> {
    return await this.misiService.create(createMisiDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterMisiDto): Promise<ApiResponse> {
    return await this.misiService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    return await this.misiService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMisiDto: UpdateMisiDto,
  ): Promise<ApiResponse> {
    return await this.misiService.update(id, updateMisiDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    return await this.misiService.remove(id);
  }
}

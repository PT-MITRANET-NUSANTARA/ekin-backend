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
import { VisiService } from './visi.service';
import { CreateVisiDto } from './dto/create-visi.dto';
import { UpdateVisiDto } from './dto/update-visi.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilterVisiDto } from './dto/filter-visi.dto';

@Controller('visi')
@UseGuards(JwtAuthGuard)
export class VisiController {
  constructor(private readonly visiService: VisiService) {}

  @Post()
  async create(@Body() createVisiDto: CreateVisiDto): Promise<ApiResponse> {
    return await this.visiService.create(createVisiDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterVisiDto): Promise<ApiResponse> {
    return await this.visiService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    return await this.visiService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVisiDto: UpdateVisiDto,
  ): Promise<ApiResponse> {
    return await this.visiService.update(id, updateVisiDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    return await this.visiService.remove(id);
  }
}

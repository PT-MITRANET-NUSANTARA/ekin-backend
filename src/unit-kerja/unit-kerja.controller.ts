import {
  Controller,
  Get,
  Param,
  Headers,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UnitKerjaService } from './unit-kerja.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { FilterUnitKerjaDto } from './dto/filter-unit-kerja.dto';
import { FilterUnitOrganisasiDto } from './dto/filter-unit-organisasi.dto';

@Controller('unit-kerja')
export class UnitKerjaController {
  constructor(private readonly unitKerjaService: UnitKerjaService) {}

  @Get()
  async findAll(
    @Headers('authorization') token: string,
    @Query() filterDto: FilterUnitKerjaDto,
  ): Promise<ApiResponse> {
    return await this.unitKerjaService.findAll(token, filterDto);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return await this.unitKerjaService.findById(id, token);
  }

  @Get('sapk/:id')
  async findByIdSapk(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return await this.unitKerjaService.findByIdSapk(id, token);
  }

  @Get(':id/unor')
  async findAllUnor(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') token: string,
    @Query() filterDto: FilterUnitOrganisasiDto,
  ): Promise<ApiResponse> {
    return await this.unitKerjaService.findAllUnor(id, token, filterDto);
  }

  @Get(':id/unor/:unor_id')
  async findUnorById(
    @Param('id', ParseIntPipe) id: number,
    @Param('unor_id') unor_id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return await this.unitKerjaService.findUnorById(id, token, unor_id);
  }

  @Get(':id/unor-hierarchy')
  async findUnorHierarchy(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return await this.unitKerjaService.findUnorHierarchy(id, token);
  }

  @Get(':id/jabatan')
  async findAllJabatan(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return await this.unitKerjaService.findAllJabatan(id, token);
  }
}

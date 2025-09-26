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
import { PeriodePenilaianService } from './periode-penilaian.service';
import { CreatePeriodePenilaianDto } from './dto/create-periode-penilaian.dto';
import { UpdatePeriodePenilaianDto } from './dto/update-periode-penilaian.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('periode-penilaian')
@UseGuards(JwtAuthGuard)
export class PeriodePenilaianController {
  constructor(private readonly periodePenilaianService: PeriodePenilaianService) {}

  @Post()
  create(
    @Body() createPeriodePenilaianDto: CreatePeriodePenilaianDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.periodePenilaianService.create(createPeriodePenilaianDto, token);
  }

  @Get()
  findAll(
    @Query('unit_id') unitId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.periodePenilaianService.findAll(unitId, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.periodePenilaianService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePeriodePenilaianDto: UpdatePeriodePenilaianDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.periodePenilaianService.update(id, updatePeriodePenilaianDto, token);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.periodePenilaianService.remove(id);
  }
}

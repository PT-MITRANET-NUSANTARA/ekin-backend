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
import { RhkService } from './rhk.service';
import { CreateRhkDto } from './dto/create-rhk.dto';
import { UpdateRhkDto } from './dto/update-rhk.dto';
import { FilterRhkDto } from './dto/filter-rhk.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('rhk')
@UseGuards(JwtAuthGuard)
export class RhkController {
  constructor(private readonly rhkService: RhkService) {}

  @Post()
  create(
    @Body() createRhkDto: CreateRhkDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkService.create(createRhkDto, token);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterRhkDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkService.findAll(filterDto, token);
  }

  @Get('skp/:skpId')
  findBySkpId(
    @Param('skpId') skpId: string,
    @Headers('authorization') token: string,
    @Query('rhkId') rhkId?: string,
  ): Promise<ApiResponse> {
    return this.rhkService.findBySkpId(skpId, token, rhkId);
  }

  @Get('skp/:skpId/periode/:periodePenilaianId')
  findBySkpIdAndPeriodePenilaian(
    @Param('skpId') skpId: string,
    @Param('periodePenilaianId') periodePenilaianId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkService.findBySkpIdAndPeriodePenilaian(
      skpId,
      periodePenilaianId,
      token,
    );
  }
  
  @Get(':id/periode-penilaian/:periodePenilaianId/realisasi')
  findRealisasi(
    @Param('id') id: string,
    @Param('periodePenilaianId') periodePenilaianId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkService.findRealisasi(id, periodePenilaianId, token);
  }
  
  @Patch(':id/periode-penilaian/:periodePenilaianId/realisasi')
  updateRealisasi(
    @Param('id') id: string,
    @Param('periodePenilaianId') periodePenilaianId: string,
    @Body() realisasiData: { realisasi: Record<string, string>[] },
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkService.updateRealisasi(id, periodePenilaianId, realisasiData.realisasi, token);
  }

  @Get(':id/bawahan')
  findByRhkAtasanId(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkService.findByRhkAtasanId(id, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRhkDto: UpdateRhkDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkService.update(id, updateRhkDto, token);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse> {
    return this.rhkService.remove(id);
  }
}

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
import { PenilaianService } from './penilaian.service';
import { CreatePenilaianDto } from './dto/create-penilaian.dto';
import { UpdatePenilaianDto } from './dto/update-penilaian.dto';
import { FilterPenilaianDto } from './dto/filter-penilaian.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PenilaianKinerjaDto } from './dto/penilaian-kinerja.dto';
import { PenilaianPerilakuDto } from './dto/penilaian-perilaku.dto';
import { PenilaianPredikatDto } from './dto/penilaian-predikat.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('penilaian')
@UseGuards(JwtAuthGuard)
export class PenilaianController {
  constructor(private readonly penilaianService: PenilaianService) {}

  @Post()
  create(
    @Body() createPenilaianDto: CreatePenilaianDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.penilaianService.create(createPenilaianDto, token);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterPenilaianDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.penilaianService.findAll(filterDto, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.penilaianService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePenilaianDto: UpdatePenilaianDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.penilaianService.update(id, updatePenilaianDto, token);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.penilaianService.remove(id, token);
  }

  @Post('predikat')
  updatePredikat(
    @Body() penilaianPredikatDto: PenilaianPredikatDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    const {
      skp_penilai_id,
      periode_penilaian_id,
      skp_dinilai_id,
      rating_predikat,
    } = penilaianPredikatDto;
    return this.penilaianService.updatePenilaianPredikat(
      skp_penilai_id,
      periode_penilaian_id,
      skp_dinilai_id,
      rating_predikat,
      token,
    );
  }

  @Post('perilaku')
  updatePerilaku(
    @Body() penilaianPerilakuDto: PenilaianPerilakuDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    const {
      skp_penilai_id,
      periode_penilaian_id,
      skp_dinilai_id,
      rating_perilaku,
    } = penilaianPerilakuDto;
    return this.penilaianService.updatePenilaianPerilaku(
      skp_penilai_id,
      periode_penilaian_id,
      skp_dinilai_id,
      rating_perilaku,
      token,
    );
  }

  @Post('kinerja')
  updateKinerja(
    @Body() penilaianKinerjaDto: PenilaianKinerjaDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    const {
      skp_penilai_id,
      periode_penilaian_id,
      skp_dinilai_id,
      rating_kinerja,
    } = penilaianKinerjaDto;
    return this.penilaianService.updatePenilaianKinerja(
      skp_penilai_id,
      periode_penilaian_id,
      skp_dinilai_id,
      rating_kinerja,
      token,
    );
  }
}

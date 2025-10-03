import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { SkpService } from './skp.service';
import { CreateSkpDto } from './dto/create-skp.dto';
import { UpdateSkpDto } from './dto/update-skp.dto';
import { FilterSkpDto } from './dto/filter-skp.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('skp')
@UseGuards(JwtAuthGuard)
export class SkpController {
  constructor(private readonly skpService: SkpService) {}

  @Post()
  create(
    @Body() createSkpDto: CreateSkpDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.create(createSkpDto, token);
  }

  @Get()
  findAll(
    @Query() filterSkpDto: FilterSkpDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findAll(filterSkpDto, token);
  }

  @Get('user/:userId')
  findByUserId(
    @Param('userId') userId: string,
    @Query() filterSkpDto: FilterSkpDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findByUserId(userId, filterSkpDto, token);
  }

  @Get(':id/bawahan')
  findByAtasanSkpId(
    @Param('id') id: string,
    @Query() filterSkpDto: FilterSkpDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findByAtasanSkpId(id, filterSkpDto, token);
  }

  @Get(':id/matriks')
  getMatriks(
    @Param('id') id: string,
    @Query('skp_id') skpId: string,
    @Query('rhk_id') rhkId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.getMatriks(id, token, skpId, rhkId);
  }

  @Get(':id/penilaian/:penilaianId')
  findOneWithPenilaian(
    @Param('id') id: string,
    @Param('penilaianId') penilaianId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findOneWithPenilaian(id, penilaianId, token);
  }

  @Get(':id/penilaian/:penilaianId/nilai')
  findOneWithPenilaianNilai(
    @Param('id') id: string,
    @Param('penilaianId') penilaianId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findOneWithPenilaianNilai(id, penilaianId, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSkpDto: UpdateSkpDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.update(id, updateSkpDto, token);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.remove(id);
  }
}

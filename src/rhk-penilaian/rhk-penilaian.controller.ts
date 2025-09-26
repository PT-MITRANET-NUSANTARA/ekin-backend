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
import { RhkPenilaianService } from './rhk-penilaian.service';
import { CreateRhkPenilaianDto } from './dto/create-rhk-penilaian.dto';
import { UpdateRhkPenilaianDto } from './dto/update-rhk-penilaian.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('rhk-penilaian')
@UseGuards(JwtAuthGuard)
export class RhkPenilaianController {
  constructor(private readonly rhkPenilaianService: RhkPenilaianService) {}

  @Post()
  create(
    @Body() createRhkPenilaianDto: CreateRhkPenilaianDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkPenilaianService.create(createRhkPenilaianDto, token);
  }

  @Get()
  findAll(
    @Query('skp_id') skpId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkPenilaianService.findAll(skpId, token);
  }
  
  @Get('by-skp/:skpId')
  findBySkpId(
    @Param('skpId') skpId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkPenilaianService.findBySkpId(skpId, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkPenilaianService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRhkPenilaianDto: UpdateRhkPenilaianDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkPenilaianService.update(id, updateRhkPenilaianDto, token);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rhkPenilaianService.remove(id);
  }
}

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
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findByUserId(userId, token);
  }

  @Get('atasan/:atasanSkpId')
  findByAtasanSkpId(
    @Param('atasanSkpId') atasanSkpId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findByAtasanSkpId(atasanSkpId, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.findOne(id, token);
  }

  @Get(':id/matriks')
  getMatriks(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.skpService.getMatriks(id, token);
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

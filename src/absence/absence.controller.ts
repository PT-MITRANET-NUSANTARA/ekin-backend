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
  Headers,
} from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { FilterAbsenceDto } from './dto/filter-absence.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('absence')
@UseGuards(JwtAuthGuard)
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post()
  async create(
    @Body() createAbsenceDto: CreateAbsenceDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.absenceService.create(createAbsenceDto, token);
  }

  @Get()
  async findAll(
    @Query() filterAbsenceDto: FilterAbsenceDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.absenceService.findAll(filterAbsenceDto, token);
  }

  @Get('user/:user_id')
  async findByUserId(
    @Param('user_id') userId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.absenceService.findByUserId(userId, token);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.absenceService.findOne(id, token);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAbsenceDto: UpdateAbsenceDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.absenceService.update(id, updateAbsenceDto, token);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.absenceService.remove(id, token);
  }
}

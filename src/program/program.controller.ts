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
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { FilterProgramDto } from './dto/filter-program.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('program')
@UseGuards(JwtAuthGuard)
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  async create(
    @Body() createProgramDto: CreateProgramDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.programService.create(createProgramDto, token);
  }

  @Get()
  async findAll(
    @Query() filterDto: FilterProgramDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.programService.findAll(filterDto, token);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.programService.findOne(id, token);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.programService.update(id, updateProgramDto, token);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.programService.remove(id, token);
  }
}

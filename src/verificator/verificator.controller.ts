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
import { VerificatorService } from './verificator.service';
import { CreateVerificatorDto } from './dto/create-verificator.dto';
import { UpdateVerificatorDto } from './dto/update-verificator.dto';
import { FilterVerificatorDto } from './dto/filter-verificator.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('verificator')
@UseGuards(JwtAuthGuard)
export class VerificatorController {
  constructor(private readonly verificatorService: VerificatorService) {}

  @Post()
  create(
    @Body() createVerificatorDto: CreateVerificatorDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.verificatorService.create(createVerificatorDto, token);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterVerificatorDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.verificatorService.findAll(filterDto, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.verificatorService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVerificatorDto: UpdateVerificatorDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.verificatorService.update(id, updateVerificatorDto, token);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse> {
    return this.verificatorService.remove(id);
  }
}

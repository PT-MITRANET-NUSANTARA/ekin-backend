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
import { RktService } from './rkt.service';
import { CreateRktDto } from './dto/create-rkt.dto';
import { UpdateRktDto } from './dto/update-rkt.dto';
import { FilterRktDto } from './dto/filter-rkt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('rkt')
@UseGuards(JwtAuthGuard)
export class RktController {
  constructor(private readonly rktService: RktService) {}

  @Post()
  create(
    @Body() createRktDto: CreateRktDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rktService.create(createRktDto, token);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterRktDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rktService.findAll(filterDto, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rktService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRktDto: UpdateRktDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.rktService.update(id, updateRktDto, token);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse> {
    return this.rktService.remove(id);
  }
}

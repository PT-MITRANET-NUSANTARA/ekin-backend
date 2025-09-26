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
import { AspekService } from './aspek.service';
import { CreateAspekDto } from './dto/create-aspek.dto';
import { UpdateAspekDto } from './dto/update-aspek.dto';
import { FilterAspekDto } from './dto/filter-aspek.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('aspek')
@UseGuards(JwtAuthGuard)
export class AspekController {
  constructor(private readonly aspekService: AspekService) {}

  @Post()
  create(
    @Body() createAspekDto: CreateAspekDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.aspekService.create(createAspekDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterAspekDto): Promise<ApiResponse> {
    return this.aspekService.findAll(filterDto);
  }

  @Get('rhk/:rhkId')
  findByRhkId(@Param('rhkId') rhkId: string): Promise<ApiResponse> {
    return this.aspekService.findByRhkId(rhkId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse> {
    return this.aspekService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAspekDto: UpdateAspekDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.aspekService.update(id, updateAspekDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.aspekService.remove(id);
  }
}

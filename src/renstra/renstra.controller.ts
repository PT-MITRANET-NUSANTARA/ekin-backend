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
import { RenstraService } from './renstra.service';
import { CreateRenstraDto } from './dto/create-renstra.dto';
import { UpdateRenstraDto } from './dto/update-renstra.dto';
import { FilterRenstraDto } from './dto/filter-renstra.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('renstra')
@UseGuards(JwtAuthGuard)
export class RenstraController {
  constructor(private readonly renstraService: RenstraService) {}

  @Post()
  async create(
    @Body() createRenstraDto: CreateRenstraDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.renstraService.create(createRenstraDto, token);
  }

  @Get()
  async findAll(
    @Query() filterDto: FilterRenstraDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.renstraService.findAll(filterDto, token);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.renstraService.findOne(id, token);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRenstraDto: UpdateRenstraDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.renstraService.update(id, updateRenstraDto, token);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    return this.renstraService.remove(id);
  }
}

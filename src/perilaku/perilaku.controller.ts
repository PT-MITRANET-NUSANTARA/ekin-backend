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
import { PerilakuService } from './perilaku.service';
import { CreatePerilakuDto } from './dto/create-perilaku.dto';
import { UpdatePerilakuDto } from './dto/update-perilaku.dto';
import { FilterPerilakuDto } from './dto/filter-perilaku.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('perilaku')
@UseGuards(JwtAuthGuard)
export class PerilakuController {
  constructor(private readonly perilakuService: PerilakuService) {}

  @Post()
  create(
    @Body() createPerilakuDto: CreatePerilakuDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perilakuService.create(createPerilakuDto, token);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterPerilakuDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perilakuService.findAll(filterDto, token);
  }

  @Get('skp/:skpId')
  findBySkpId(
    @Param('skpId') skpId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perilakuService.findBySkpId(skpId, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perilakuService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePerilakuDto: UpdatePerilakuDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perilakuService.update(id, updatePerilakuDto, token);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perilakuService.remove(id, token);
  }
}

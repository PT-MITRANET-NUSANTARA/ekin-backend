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
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { FilterLogDto } from './dto/filter-log.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  async create(@Body() createLogDto: CreateLogDto): Promise<ApiResponse> {
    return await this.logsService.create(createLogDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterLogDto): Promise<ApiResponse> {
    return await this.logsService.findAll(filterDto);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
    @Query() filterDto: FilterLogDto,
  ): Promise<ApiResponse> {
    return await this.logsService.findByUserId(userId, filterDto);
  }

  @Get('model/:modelId')
  async findByModelId(
    @Param('modelId') modelId: string,
    @Query() filterDto: FilterLogDto,
  ): Promise<ApiResponse> {
    return await this.logsService.findByModelId(modelId, filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    return await this.logsService.findOne(id);
  }
}

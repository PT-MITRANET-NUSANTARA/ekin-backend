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
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('initialize')
  async initialize(): Promise<ApiResponse> {
    return await this.settingsService.initialize();
  }

  @Get('latest')
  async getLatestSetting(): Promise<ApiResponse> {
    return await this.settingsService.getLatestSetting();
  }

  @Post()
  async create(
    @Body() createSettingDto: CreateSettingDto,
  ): Promise<ApiResponse> {
    return await this.settingsService.create(createSettingDto);
  }

  @Get()
  async findAll(@Query() query: any): Promise<ApiResponse> {
    return await this.settingsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    return await this.settingsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ): Promise<ApiResponse> {
    return await this.settingsService.update(id, updateSettingDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    return await this.settingsService.remove(id);
  }
}

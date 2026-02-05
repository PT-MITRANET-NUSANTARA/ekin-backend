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
import { CalenderService } from './calender.service';
import { CreateCalenderDto } from './dto/create-calender.dto';
import { UpdateCalenderDto } from './dto/update-calender.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FilterCalenderDto } from './dto/filter-calender.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('calender')
@UseGuards(JwtAuthGuard)
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @Post()
  create(
    @Body() createCalenderDto: CreateCalenderDto,
    @CurrentUser() user: any,
  ): Promise<ApiResponse> {
    return this.calenderService.create(createCalenderDto, user);
  }

  @Get()
  findAll(@Query() filterDto: FilterCalenderDto): Promise<ApiResponse> {
    return this.calenderService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse> {
    return this.calenderService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCalenderDto: UpdateCalenderDto,
    @CurrentUser() user: any,
  ): Promise<ApiResponse> {
    return this.calenderService.update(id, updateCalenderDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ApiResponse> {
    return this.calenderService.remove(id, user);
  }
}

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
import { FeedbackPerilakuService } from './feedback-perilaku.service';
import { CreateFeedbackPerilakuDto } from './dto/create-feedback-perilaku.dto';
import { UpdateFeedbackPerilakuDto } from './dto/update-feedback-perilaku.dto';
import { FilterFeedbackPerilakuDto } from './dto/filter-feedback-perilaku.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('feedback-perilaku')
@UseGuards(JwtAuthGuard)
export class FeedbackPerilakuController {
  constructor(
    private readonly feedbackPerilakuService: FeedbackPerilakuService,
  ) {}

  @Post()
  create(
    @Body() createFeedbackPerilakuDto: CreateFeedbackPerilakuDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackPerilakuService.create(
      createFeedbackPerilakuDto,
      token,
    );
  }

  @Get()
  findAll(
    @Query() filterDto: FilterFeedbackPerilakuDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackPerilakuService.findAll(filterDto, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackPerilakuService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFeedbackPerilakuDto: UpdateFeedbackPerilakuDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackPerilakuService.update(
      id,
      updateFeedbackPerilakuDto,
      token,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse> {
    return this.feedbackPerilakuService.remove(id);
  }
}

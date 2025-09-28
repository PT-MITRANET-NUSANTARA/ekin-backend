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
import { FeedbackAspekService } from './feedback-aspek.service';
import { CreateFeedbackAspekDto } from './dto/create-feedback-aspek.dto';
import { UpdateFeedbackAspekDto } from './dto/update-feedback-aspek.dto';
import { FilterFeedbackAspekDto } from './dto/filter-feedback-aspek.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('feedback-aspek')
@UseGuards(JwtAuthGuard)
export class FeedbackAspekController {
  constructor(private readonly feedbackAspekService: FeedbackAspekService) {}

  @Post()
  create(
    @Body() createFeedbackAspekDto: CreateFeedbackAspekDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackAspekService.create(createFeedbackAspekDto, token);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterFeedbackAspekDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackAspekService.findAll(filterDto, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackAspekService.findOne(id, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFeedbackAspekDto: UpdateFeedbackAspekDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackAspekService.update(id, updateFeedbackAspekDto, token);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.feedbackAspekService.remove(id, token);
  }
}

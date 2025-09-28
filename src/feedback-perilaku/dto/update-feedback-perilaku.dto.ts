import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedbackPerilakuDto } from './create-feedback-perilaku.dto';

export class UpdateFeedbackPerilakuDto extends PartialType(
  CreateFeedbackPerilakuDto,
) {}

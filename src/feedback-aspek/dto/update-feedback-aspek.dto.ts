import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedbackAspekDto } from './create-feedback-aspek.dto';

export class UpdateFeedbackAspekDto extends PartialType(
  CreateFeedbackAspekDto,
) {}

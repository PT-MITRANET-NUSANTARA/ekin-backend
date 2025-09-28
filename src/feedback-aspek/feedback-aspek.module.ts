import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackAspekService } from './feedback-aspek.service';
import { FeedbackAspekController } from './feedback-aspek.controller';
import { FeedbackAspek } from './entities/feedback-aspek.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackAspek]), AuthModule],
  controllers: [FeedbackAspekController],
  providers: [FeedbackAspekService],
  exports: [FeedbackAspekService],
})
export class FeedbackAspekModule {}

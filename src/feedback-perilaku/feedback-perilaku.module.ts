import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackPerilakuService } from './feedback-perilaku.service';
import { FeedbackPerilakuController } from './feedback-perilaku.controller';
import { FeedbackPerilaku } from './entities/feedback-perilaku.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackPerilaku]), AuthModule],
  controllers: [FeedbackPerilakuController],
  providers: [FeedbackPerilakuService],
  exports: [FeedbackPerilakuService],
})
export class FeedbackPerilakuModule {}

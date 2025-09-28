import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackPerilakuController } from './feedback-perilaku.controller';
import { FeedbackPerilakuService } from './feedback-perilaku.service';

describe('FeedbackPerilakuController', () => {
  let controller: FeedbackPerilakuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackPerilakuController],
      providers: [FeedbackPerilakuService],
    }).compile();

    controller = module.get<FeedbackPerilakuController>(
      FeedbackPerilakuController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

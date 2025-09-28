import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackAspekController } from './feedback-aspek.controller';
import { FeedbackAspekService } from './feedback-aspek.service';

describe('FeedbackAspekController', () => {
  let controller: FeedbackAspekController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackAspekController],
      providers: [FeedbackAspekService],
    }).compile();

    controller = module.get<FeedbackAspekController>(FeedbackAspekController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

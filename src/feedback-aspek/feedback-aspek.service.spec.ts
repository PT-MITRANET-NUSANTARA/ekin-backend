import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackAspekService } from './feedback-aspek.service';

describe('FeedbackAspekService', () => {
  let service: FeedbackAspekService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackAspekService],
    }).compile();

    service = module.get<FeedbackAspekService>(FeedbackAspekService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

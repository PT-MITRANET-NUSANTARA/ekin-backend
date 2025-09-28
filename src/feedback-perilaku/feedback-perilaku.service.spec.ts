import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackPerilakuService } from './feedback-perilaku.service';

describe('FeedbackPerilakuService', () => {
  let service: FeedbackPerilakuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackPerilakuService],
    }).compile();

    service = module.get<FeedbackPerilakuService>(FeedbackPerilakuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

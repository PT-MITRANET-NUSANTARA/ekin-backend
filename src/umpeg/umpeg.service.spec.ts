import { Test, TestingModule } from '@nestjs/testing';
import { UmpegService } from './umpeg.service';

describe('UmpegService', () => {
  let service: UmpegService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UmpegService],
    }).compile();

    service = module.get<UmpegService>(UmpegService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AspekService } from './aspek.service';

describe('AspekService', () => {
  let service: AspekService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AspekService],
    }).compile();

    service = module.get<AspekService>(AspekService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

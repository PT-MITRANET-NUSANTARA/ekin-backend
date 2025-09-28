import { Test, TestingModule } from '@nestjs/testing';
import { HarianService } from './harian.service';

describe('HarianService', () => {
  let service: HarianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HarianService],
    }).compile();

    service = module.get<HarianService>(HarianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

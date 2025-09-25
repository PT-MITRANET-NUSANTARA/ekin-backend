import { Test, TestingModule } from '@nestjs/testing';
import { SkpService } from './skp.service';

describe('SkpService', () => {
  let service: SkpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkpService],
    }).compile();

    service = module.get<SkpService>(SkpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

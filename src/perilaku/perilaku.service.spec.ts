import { Test, TestingModule } from '@nestjs/testing';
import { PerilakuService } from './perilaku.service';

describe('PerilakuService', () => {
  let service: PerilakuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerilakuService],
    }).compile();

    service = module.get<PerilakuService>(PerilakuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

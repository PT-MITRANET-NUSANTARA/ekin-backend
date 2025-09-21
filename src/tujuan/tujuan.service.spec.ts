import { Test, TestingModule } from '@nestjs/testing';
import { TujuanService } from './tujuan.service';

describe('TujuanService', () => {
  let service: TujuanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TujuanService],
    }).compile();

    service = module.get<TujuanService>(TujuanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PeriodePenilaianService } from './periode-penilaian.service';

describe('PeriodePenilaianService', () => {
  let service: PeriodePenilaianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeriodePenilaianService],
    }).compile();

    service = module.get<PeriodePenilaianService>(PeriodePenilaianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

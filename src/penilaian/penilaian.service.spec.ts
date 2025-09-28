import { Test, TestingModule } from '@nestjs/testing';
import { PenilaianService } from './penilaian.service';

describe('PenilaianService', () => {
  let service: PenilaianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PenilaianService],
    }).compile();

    service = module.get<PenilaianService>(PenilaianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

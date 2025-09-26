import { Test, TestingModule } from '@nestjs/testing';
import { RhkPenilaianService } from './rhk-penilaian.service';

describe('RhkPenilaianService', () => {
  let service: RhkPenilaianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RhkPenilaianService],
    }).compile();

    service = module.get<RhkPenilaianService>(RhkPenilaianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

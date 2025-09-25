import { Test, TestingModule } from '@nestjs/testing';
import { PerjanjianKinerjaService } from './perjanjian-kinerja.service';

describe('PerjanjianKinerjaService', () => {
  let service: PerjanjianKinerjaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerjanjianKinerjaService],
    }).compile();

    service = module.get<PerjanjianKinerjaService>(PerjanjianKinerjaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

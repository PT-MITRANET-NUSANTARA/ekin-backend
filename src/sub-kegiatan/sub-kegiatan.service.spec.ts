import { Test, TestingModule } from '@nestjs/testing';
import { SubKegiatanService } from './sub-kegiatan.service';

describe('SubKegiatanService', () => {
  let service: SubKegiatanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubKegiatanService],
    }).compile();

    service = module.get<SubKegiatanService>(SubKegiatanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

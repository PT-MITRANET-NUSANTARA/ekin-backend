import { Test, TestingModule } from '@nestjs/testing';
import { RencanaAksiService } from './rencana-aksi.service';

describe('RencanaAksiService', () => {
  let service: RencanaAksiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RencanaAksiService],
    }).compile();

    service = module.get<RencanaAksiService>(RencanaAksiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

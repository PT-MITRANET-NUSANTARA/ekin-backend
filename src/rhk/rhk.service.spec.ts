import { Test, TestingModule } from '@nestjs/testing';
import { RhkService } from './rhk.service';

describe('RhkService', () => {
  let service: RhkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RhkService],
    }).compile();

    service = module.get<RhkService>(RhkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RktService } from './rkt.service';

describe('RktService', () => {
  let service: RktService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RktService],
    }).compile();

    service = module.get<RktService>(RktService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RenstraService } from './renstra.service';

describe('RenstraService', () => {
  let service: RenstraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RenstraService],
    }).compile();

    service = module.get<RenstraService>(RenstraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

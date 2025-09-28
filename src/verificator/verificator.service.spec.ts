import { Test, TestingModule } from '@nestjs/testing';
import { VerificatorService } from './verificator.service';

describe('VerificatorService', () => {
  let service: VerificatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificatorService],
    }).compile();

    service = module.get<VerificatorService>(VerificatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

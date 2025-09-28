import { Test, TestingModule } from '@nestjs/testing';
import { VerificatorController } from './verificator.controller';
import { VerificatorService } from './verificator.service';

describe('VerificatorController', () => {
  let controller: VerificatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificatorController],
      providers: [VerificatorService],
    }).compile();

    controller = module.get<VerificatorController>(VerificatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

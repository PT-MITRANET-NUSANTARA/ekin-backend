import { Test, TestingModule } from '@nestjs/testing';
import { SkpController } from './skp.controller';
import { SkpService } from './skp.service';

describe('SkpController', () => {
  let controller: SkpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkpController],
      providers: [SkpService],
    }).compile();

    controller = module.get<SkpController>(SkpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

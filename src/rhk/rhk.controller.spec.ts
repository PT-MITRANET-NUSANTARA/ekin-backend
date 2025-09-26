import { Test, TestingModule } from '@nestjs/testing';
import { RhkController } from './rhk.controller';
import { RhkService } from './rhk.service';

describe('RhkController', () => {
  let controller: RhkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RhkController],
      providers: [RhkService],
    }).compile();

    controller = module.get<RhkController>(RhkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

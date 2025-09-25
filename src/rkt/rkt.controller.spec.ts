import { Test, TestingModule } from '@nestjs/testing';
import { RktController } from './rkt.controller';
import { RktService } from './rkt.service';

describe('RktController', () => {
  let controller: RktController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RktController],
      providers: [RktService],
    }).compile();

    controller = module.get<RktController>(RktController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

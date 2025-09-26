import { Test, TestingModule } from '@nestjs/testing';
import { AspekController } from './aspek.controller';
import { AspekService } from './aspek.service';

describe('AspekController', () => {
  let controller: AspekController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AspekController],
      providers: [AspekService],
    }).compile();

    controller = module.get<AspekController>(AspekController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HarianController } from './harian.controller';
import { HarianService } from './harian.service';

describe('HarianController', () => {
  let controller: HarianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HarianController],
      providers: [HarianService],
    }).compile();

    controller = module.get<HarianController>(HarianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

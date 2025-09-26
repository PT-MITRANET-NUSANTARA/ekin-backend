import { Test, TestingModule } from '@nestjs/testing';
import { PerilakuController } from './perilaku.controller';
import { PerilakuService } from './perilaku.service';

describe('PerilakuController', () => {
  let controller: PerilakuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerilakuController],
      providers: [PerilakuService],
    }).compile();

    controller = module.get<PerilakuController>(PerilakuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

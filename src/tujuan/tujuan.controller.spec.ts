import { Test, TestingModule } from '@nestjs/testing';
import { TujuanController } from './tujuan.controller';
import { TujuanService } from './tujuan.service';

describe('TujuanController', () => {
  let controller: TujuanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TujuanController],
      providers: [TujuanService],
    }).compile();

    controller = module.get<TujuanController>(TujuanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

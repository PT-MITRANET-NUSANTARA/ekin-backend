import { Test, TestingModule } from '@nestjs/testing';
import { KegiatanController } from './kegiatan.controller';
import { KegiatanService } from './kegiatan.service';

describe('KegiatanController', () => {
  let controller: KegiatanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KegiatanController],
      providers: [KegiatanService],
    }).compile();

    controller = module.get<KegiatanController>(KegiatanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

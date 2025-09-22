import { Test, TestingModule } from '@nestjs/testing';
import { SubKegiatanController } from './sub-kegiatan.controller';
import { SubKegiatanService } from './sub-kegiatan.service';

describe('SubKegiatanController', () => {
  let controller: SubKegiatanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubKegiatanController],
      providers: [SubKegiatanService],
    }).compile();

    controller = module.get<SubKegiatanController>(SubKegiatanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

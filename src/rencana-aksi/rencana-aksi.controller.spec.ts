import { Test, TestingModule } from '@nestjs/testing';
import { RencanaAksiController } from './rencana-aksi.controller';
import { RencanaAksiService } from './rencana-aksi.service';

describe('RencanaAksiController', () => {
  let controller: RencanaAksiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RencanaAksiController],
      providers: [RencanaAksiService],
    }).compile();

    controller = module.get<RencanaAksiController>(RencanaAksiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

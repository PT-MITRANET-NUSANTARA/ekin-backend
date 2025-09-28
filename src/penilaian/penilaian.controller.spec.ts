import { Test, TestingModule } from '@nestjs/testing';
import { PenilaianController } from './penilaian.controller';
import { PenilaianService } from './penilaian.service';

describe('PenilaianController', () => {
  let controller: PenilaianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenilaianController],
      providers: [PenilaianService],
    }).compile();

    controller = module.get<PenilaianController>(PenilaianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

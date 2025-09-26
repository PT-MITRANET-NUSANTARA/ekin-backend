import { Test, TestingModule } from '@nestjs/testing';
import { RhkPenilaianController } from './rhk-penilaian.controller';
import { RhkPenilaianService } from './rhk-penilaian.service';

describe('RhkPenilaianController', () => {
  let controller: RhkPenilaianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RhkPenilaianController],
      providers: [RhkPenilaianService],
    }).compile();

    controller = module.get<RhkPenilaianController>(RhkPenilaianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

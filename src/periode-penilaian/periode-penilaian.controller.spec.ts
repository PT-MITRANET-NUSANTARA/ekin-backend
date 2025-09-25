import { Test, TestingModule } from '@nestjs/testing';
import { PeriodePenilaianController } from './periode-penilaian.controller';
import { PeriodePenilaianService } from './periode-penilaian.service';

describe('PeriodePenilaianController', () => {
  let controller: PeriodePenilaianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodePenilaianController],
      providers: [PeriodePenilaianService],
    }).compile();

    controller = module.get<PeriodePenilaianController>(
      PeriodePenilaianController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

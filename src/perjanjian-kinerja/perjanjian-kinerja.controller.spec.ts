import { Test, TestingModule } from '@nestjs/testing';
import { PerjanjianKinerjaController } from './perjanjian-kinerja.controller';
import { PerjanjianKinerjaService } from './perjanjian-kinerja.service';

describe('PerjanjianKinerjaController', () => {
  let controller: PerjanjianKinerjaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerjanjianKinerjaController],
      providers: [PerjanjianKinerjaService],
    }).compile();

    controller = module.get<PerjanjianKinerjaController>(
      PerjanjianKinerjaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

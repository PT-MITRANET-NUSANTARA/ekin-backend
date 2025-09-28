import { Test, TestingModule } from '@nestjs/testing';
import { UmpegController } from './umpeg.controller';
import { UmpegService } from './umpeg.service';

describe('UmpegController', () => {
  let controller: UmpegController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UmpegController],
      providers: [UmpegService],
    }).compile();

    controller = module.get<UmpegController>(UmpegController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

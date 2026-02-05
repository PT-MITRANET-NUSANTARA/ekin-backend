import { Test, TestingModule } from '@nestjs/testing';
import { CalenderController } from './calender.controller';
import { CalenderService } from './calender.service';

describe('CalenderController', () => {
  let controller: CalenderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalenderController],
      providers: [CalenderService],
    }).compile();

    controller = module.get<CalenderController>(CalenderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

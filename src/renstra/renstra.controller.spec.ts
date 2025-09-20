import { Test, TestingModule } from '@nestjs/testing';
import { RenstraController } from './renstra.controller';
import { RenstraService } from './renstra.service';

describe('RenstraController', () => {
  let controller: RenstraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RenstraController],
      providers: [RenstraService],
    }).compile();

    controller = module.get<RenstraController>(RenstraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Module } from '@nestjs/common';
import { UnitKerjaService } from './unit-kerja.service';
import { UnitKerjaController } from './unit-kerja.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [UnitKerjaController],
  providers: [UnitKerjaService],
})
export class UnitKerjaModule {}

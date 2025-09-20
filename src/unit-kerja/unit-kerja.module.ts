import { Module } from '@nestjs/common';
import { UnitKerjaService } from './unit-kerja.service';
import { UnitKerjaController } from './unit-kerja.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [UnitKerjaController],
  providers: [UnitKerjaService],
  exports: [UnitKerjaService],
})
export class UnitKerjaModule {}

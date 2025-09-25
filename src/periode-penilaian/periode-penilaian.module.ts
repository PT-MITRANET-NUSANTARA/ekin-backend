import { Module } from '@nestjs/common';
import { PeriodePenilaianService } from './periode-penilaian.service';
import { PeriodePenilaianController } from './periode-penilaian.controller';

@Module({
  controllers: [PeriodePenilaianController],
  providers: [PeriodePenilaianService],
})
export class PeriodePenilaianModule {}

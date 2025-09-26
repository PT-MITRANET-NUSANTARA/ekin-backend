import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodePenilaianService } from './periode-penilaian.service';
import { PeriodePenilaianController } from './periode-penilaian.controller';
import { PeriodePenilaian } from './entities/periode-penilaian.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodePenilaian]), AuthModule],
  controllers: [PeriodePenilaianController],
  providers: [PeriodePenilaianService],
  exports: [PeriodePenilaianService],
})
export class PeriodePenilaianModule {}

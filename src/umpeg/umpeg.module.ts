import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UmpegService } from './umpeg.service';
import { UmpegController } from './umpeg.controller';
import { Umpeg } from './entities/umpeg.entity';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Umpeg]), UnitKerjaModule, AuthModule],
  controllers: [UmpegController],
  providers: [UmpegService],
  exports: [UmpegService],
})
export class UmpegModule {}

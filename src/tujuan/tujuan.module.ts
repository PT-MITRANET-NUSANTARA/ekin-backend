import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TujuanService } from './tujuan.service';
import { TujuanController } from './tujuan.controller';
import { Tujuan } from './entities/tujuan.entity';
import { IndikatorKinerjaModule } from '../indikator-kinerja/indikator-kinerja.module';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tujuan]),
    IndikatorKinerjaModule,
    UnitKerjaModule,
    AuthModule,
  ],
  controllers: [TujuanController],
  providers: [TujuanService],
  exports: [TujuanService],
})
export class TujuanModule {}

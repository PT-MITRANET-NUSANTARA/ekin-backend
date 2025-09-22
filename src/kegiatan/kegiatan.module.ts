import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kegiatan } from './entities/kegiatan.entity';
import { IndikatorKinerjaModule } from '../indikator-kinerja/indikator-kinerja.module';
import { ProgramModule } from '../program/program.module';
import { Program } from '../program/entities/program.entity';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kegiatan, Program]),
    IndikatorKinerjaModule,
    ProgramModule,
    UnitKerjaModule,
    AuthModule,
  ],
  controllers: [KegiatanController],
  providers: [KegiatanService],
  exports: [KegiatanService],
})
export class KegiatanModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubKegiatanService } from './sub-kegiatan.service';
import { SubKegiatanController } from './sub-kegiatan.controller';
import { SubKegiatan } from './entities/sub-kegiatan.entity';
import { Kegiatan } from '../kegiatan/entities/kegiatan.entity';
import { IndikatorKinerjaModule } from '../indikator-kinerja/indikator-kinerja.module';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubKegiatan, Kegiatan]),
    IndikatorKinerjaModule,
    UnitKerjaModule,
    AuthModule,
  ],
  controllers: [SubKegiatanController],
  providers: [SubKegiatanService],
  exports: [SubKegiatanService],
})
export class SubKegiatanModule {}

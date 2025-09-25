import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RktService } from './rkt.service';
import { RktController } from './rkt.controller';
import { Rkt } from './entities/rkt.entity';
import { SubKegiatan } from '../sub-kegiatan/entities/sub-kegiatan.entity';
import { IndikatorKinerjaModule } from '../indikator-kinerja/indikator-kinerja.module';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rkt, SubKegiatan]),
    IndikatorKinerjaModule,
    UnitKerjaModule,
    AuthModule,
  ],
  controllers: [RktController],
  providers: [RktService],
  exports: [RktService],
})
export class RktModule {}

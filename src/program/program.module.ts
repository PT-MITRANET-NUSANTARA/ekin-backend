import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { Program } from './entities/program.entity';
import { IndikatorKinerjaModule } from '../indikator-kinerja/indikator-kinerja.module';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Program]),
    IndikatorKinerjaModule,
    UnitKerjaModule,
    AuthModule,
  ],
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService],
})
export class ProgramModule {}

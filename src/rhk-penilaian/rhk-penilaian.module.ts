import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RhkPenilaianService } from './rhk-penilaian.service';
import { RhkPenilaianController } from './rhk-penilaian.controller';
import { RhkPenilaian } from './entities/rhk-penilaian.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([RhkPenilaian]), AuthModule],
  controllers: [RhkPenilaianController],
  providers: [RhkPenilaianService],
  exports: [RhkPenilaianService],
})
export class RhkPenilaianModule {}

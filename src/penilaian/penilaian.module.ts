import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenilaianService } from './penilaian.service';
import { PenilaianController } from './penilaian.controller';
import { Penilaian } from './entities/penilaian.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Penilaian]), AuthModule],
  controllers: [PenilaianController],
  providers: [PenilaianService],
  exports: [PenilaianService],
})
export class PenilaianModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RencanaAksiService } from './rencana-aksi.service';
import { RencanaAksiController } from './rencana-aksi.controller';
import { RencanaAksi } from './entities/rencana-aksi.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RencanaAksi]),
    AuthModule,
  ],
  controllers: [RencanaAksiController],
  providers: [RencanaAksiService],
  exports: [RencanaAksiService],
})
export class RencanaAksiModule {}

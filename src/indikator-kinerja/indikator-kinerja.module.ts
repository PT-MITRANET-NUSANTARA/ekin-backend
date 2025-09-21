import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndikatorKinerjaService } from './indikator-kinerja.service';
import { IndikatorKinerjaController } from './indikator-kinerja.controller';
import { IndikatorKinerja } from './entities/indikator-kinerja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndikatorKinerja])],
  controllers: [IndikatorKinerjaController],
  providers: [IndikatorKinerjaService],
  exports: [IndikatorKinerjaService],
})
export class IndikatorKinerjaModule {}

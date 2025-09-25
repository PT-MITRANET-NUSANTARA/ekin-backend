import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerjanjianKinerjaService } from './perjanjian-kinerja.service';
import { PerjanjianKinerjaController } from './perjanjian-kinerja.controller';
import { PerjanjianKinerja } from './entities/perjanjian-kinerja.entity';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerjanjianKinerja]),
    UnitKerjaModule,
    AuthModule,
  ],
  controllers: [PerjanjianKinerjaController],
  providers: [PerjanjianKinerjaService],
  exports: [PerjanjianKinerjaService],
})
export class PerjanjianKinerjaModule {}

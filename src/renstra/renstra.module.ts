import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RenstraService } from './renstra.service';
import { RenstraController } from './renstra.controller';
import { Renstra } from './entities/renstra.entity';
import { Misi } from '../misi/entities/misi.entity';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Renstra, Misi]),
    UnitKerjaModule,
    AuthModule,
  ],
  controllers: [RenstraController],
  providers: [RenstraService],
  exports: [RenstraService],
})
export class RenstraModule {}

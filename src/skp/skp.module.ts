import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkpService } from './skp.service';
import { SkpController } from './skp.controller';
import { Skp } from './entities/skp.entity';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';
import { PerilakuModule } from '../perilaku/perilaku.module';
import { UserModule } from '../user/user.module';
import { RhkModule } from '../rhk/rhk.module';
import { PerjanjianKinerjaModule } from '../perjanjian-kinerja/perjanjian-kinerja.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skp]),
    UnitKerjaModule,
    PerilakuModule,
    AuthModule,
    UserModule,
    RhkModule,
    PerjanjianKinerjaModule,
  ],
  controllers: [SkpController],
  providers: [SkpService],
  exports: [SkpService],
})
export class SkpModule {}

import { Module } from '@nestjs/common';
import { SkpService } from './skp.service';
import { SkpController } from './skp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skp } from './entities/skp.entity';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { PerilakuModule } from '../perilaku/perilaku.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RhkModule } from '../rhk/rhk.module';
import { PerjanjianKinerjaModule } from '../perjanjian-kinerja/perjanjian-kinerja.module';
import { FeedbackPerilaku } from '../feedback-perilaku/entities/feedback-perilaku.entity';
import { FeedbackAspek } from '../feedback-aspek/entities/feedback-aspek.entity';
import { Penilaian } from '../penilaian/entities/penilaian.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skp, FeedbackPerilaku, FeedbackAspek, Penilaian]),
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

import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwksService } from './jwks.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from '../settings/entities/setting.entity';
import { UserModule } from '../user/user.module';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { UmpegModule } from '../umpeg/umpeg.module';
import { VerificatorModule } from '../verificator/verificator.module';
import { AbsenceModule } from '../absence/absence.module';
import { HarianModule } from '../harian/harian.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Setting]),
    forwardRef(() => UserModule),
    forwardRef(() => UnitKerjaModule),
    forwardRef(() => UmpegModule),
    forwardRef(() => VerificatorModule),
    forwardRef(() => AbsenceModule),
    forwardRef(() => HarianModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwksService, JwtAuthGuard],
  exports: [AuthService, JwksService, JwtAuthGuard],
})
export class AuthModule {}

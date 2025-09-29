import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificatorService } from './verificator.service';
import { VerificatorController } from './verificator.controller';
import { Verificator } from './entities/verificator.entity';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verificator]),
    forwardRef(() => UnitKerjaModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [VerificatorController],
  providers: [VerificatorService],
  exports: [VerificatorService],
})
export class VerificatorModule {}

import { Module, forwardRef } from '@nestjs/common';
import { UnitKerjaService } from './unit-kerja.service';
import { UnitKerjaController } from './unit-kerja.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [UnitKerjaController],
  providers: [UnitKerjaService],
  exports: [UnitKerjaService],
})
export class UnitKerjaModule {}

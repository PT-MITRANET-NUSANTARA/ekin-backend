import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';

@Module({
  imports: [
    ConfigModule, 
    HttpModule, 
    forwardRef(() => AuthModule),
    forwardRef(() => UnitKerjaModule)
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

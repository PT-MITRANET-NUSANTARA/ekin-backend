import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, HttpModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

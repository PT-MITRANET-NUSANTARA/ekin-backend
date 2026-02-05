import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalenderService } from './calender.service';
import { CalenderController } from './calender.controller';
import { Calender } from './entities/calender.entity';
import { AuthModule } from '../auth/auth.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Calender]), AuthModule, LogsModule],
  controllers: [CalenderController],
  providers: [CalenderService],
})
export class CalenderModule {}

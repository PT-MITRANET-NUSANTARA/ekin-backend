import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisiService } from './visi.service';
import { VisiController } from './visi.controller';
import { Visi } from './entities/visi.entity';
import { AuthModule } from '../auth/auth.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Visi]), AuthModule, LogsModule],
  controllers: [VisiController],
  providers: [VisiService],
})
export class VisiModule {}

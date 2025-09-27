import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RhkService } from './rhk.service';
import { RhkController } from './rhk.controller';
import { Rhk } from './entities/rhk.entity';
import { AuthModule } from '../auth/auth.module';
import { AspekModule } from '../aspek/aspek.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rhk]), AuthModule, AspekModule],
  controllers: [RhkController],
  providers: [RhkService],
  exports: [RhkService],
})
export class RhkModule {}

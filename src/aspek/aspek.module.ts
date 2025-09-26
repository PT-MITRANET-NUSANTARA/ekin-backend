import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AspekService } from './aspek.service';
import { AspekController } from './aspek.controller';
import { Aspek } from './entities/aspek.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aspek]), AuthModule],
  controllers: [AspekController],
  providers: [AspekService],
  exports: [AspekService],
})
export class AspekModule {}

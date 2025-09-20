import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MisiService } from './misi.service';
import { MisiController } from './misi.controller';
import { Misi } from './entities/misi.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Misi]), AuthModule],
  controllers: [MisiController],
  providers: [MisiService],
})
export class MisiModule {}

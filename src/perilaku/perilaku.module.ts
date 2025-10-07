import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerilakuService } from './perilaku.service';
import { PerilakuController } from './perilaku.controller';
import { Perilaku } from './entities/perilaku.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Perilaku]), 
    forwardRef(() => AuthModule)
  ],
  controllers: [PerilakuController],
  providers: [PerilakuService],
  exports: [PerilakuService],
})
export class PerilakuModule {}

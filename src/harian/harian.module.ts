import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HarianService } from './harian.service';
import { HarianController } from './harian.controller';
import { Harian } from './entities/harian.entity';
import { RencanaAksi } from '../rencana-aksi/entities/rencana-aksi.entity';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { RhkModule } from '../rhk/rhk.module';
import { SkpModule } from '../skp/skp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Harian, RencanaAksi]),
    forwardRef(() => AuthModule),
    RhkModule,
    SkpModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/harian';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  ],
  controllers: [HarianController],
  providers: [HarianService],
  exports: [HarianService],
})
export class HarianModule {}

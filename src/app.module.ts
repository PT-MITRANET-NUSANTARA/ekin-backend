import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig, appConfig, idAsnConfig } from './config';
import { AuthModule } from './auth/auth.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { VisiModule } from './visi/visi.module';
import { MisiModule } from './misi/misi.module';
import { UnitKerjaModule } from './unit-kerja/unit-kerja.module';
import { RenstraModule } from './renstra/renstra.module';
import { TujuanModule } from './tujuan/tujuan.module';
import { IndikatorKinerjaModule } from './indikator-kinerja/indikator-kinerja.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, idAsnConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    VisiModule,
    MisiModule,
    UnitKerjaModule,
    RenstraModule,
    TujuanModule,
    IndikatorKinerjaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}

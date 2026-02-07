import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Setting } from 'src/settings/entities/setting.entity';
import { Calender } from 'src/calender/entities/calender.entity';
import { SettingSeeder } from './setting.seeder';
import { CalenderSeeder } from './calender.seeder';
import { SeedCommand } from './seed.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Setting, Calender],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([Setting, Calender]),
  ],
  providers: [
    SettingSeeder,
    CalenderSeeder,
    SeedCommand,
  ],
  exports: [
    SettingSeeder,
    CalenderSeeder,
    SeedCommand,
  ],
})
export class SeederModule {}

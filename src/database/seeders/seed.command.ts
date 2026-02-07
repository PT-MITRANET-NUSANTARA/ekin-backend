import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SettingSeeder } from './setting.seeder';
import { CalenderSeeder } from './calender.seeder';

@Injectable()
@Command({ name: 'seed', description: 'Seed database with initial data' })
export class SeedCommand extends CommandRunner {
  constructor(
    private dataSource: DataSource,
    private settingSeeder: SettingSeeder,
    private calenderSeeder: CalenderSeeder,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('Starting database seeding...');
      // Menghapus semua data yang ada terlebih dahulu di seluruh entity/tables
      console.log('Ensuring database schema is in place...');
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Ambil daftar tabel yang ada di schema public
        let rows: Array<{ tablename: string }> = await queryRunner.query(
          `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
        );
        let existingTables = new Set(rows.map((r) => r.tablename));

        // Jika tabel inti belum ada, sinkronkan schema agar tabel dibuat
        const baseTables = ['settings', 'calender'];
        const missingBase = baseTables.filter((t) => !existingTables.has(t));
        if (missingBase.length > 0) {
          console.log(
            'Base tables missing, running TypeORM synchronize to create schema...',
            missingBase,
          );
          // Lepas transaksi sementara untuk synchronize
          await queryRunner.rollbackTransaction();
          await this.dataSource.synchronize();
          // Mulai transaksi baru untuk fase truncate
          await queryRunner.startTransaction();
          // Refresh daftar tabel
          rows = await queryRunner.query(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
          );
          existingTables = new Set(rows.map((r) => r.tablename));
        }

        // Daftar tabel yang ingin dikosongkan (whitelist)
        const targetTables = ['settings', 'calender'].filter((name) =>
          existingTables.has(name),
        );

        if (targetTables.length > 0) {
          const truncateSql = `TRUNCATE TABLE ${targetTables
            .map((n) => `"${n}"`)
            .join(', ')} RESTART IDENTITY CASCADE`;
          await queryRunner.query(truncateSql);
          console.log('Tables truncated:', targetTables.join(', '));
        } else {
          console.log('No target tables exist yet; skipping truncate.');
        }

        await queryRunner.commitTransaction();
        console.log('Schema ensured and truncate phase finished successfully');
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error truncating tables:', error);
        // Jangan throw agar proses seeding tetap lanjut apabila truncate tidak diperlukan
      } finally {
        await queryRunner.release();
      }

      console.log('All existing data cleared');

      await this.settingSeeder.seed();
      await this.calenderSeeder.seed();

      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error during database seeding:', error);
    }
  }
}

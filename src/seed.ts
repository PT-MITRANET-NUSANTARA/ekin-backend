import { NestFactory } from '@nestjs/core';
import { SeedCommand } from './database/seeders/seed.command';
import { SeederCommandModule } from './database/seeders/seeder.command.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederCommandModule);

  try {
    const seedCommand = app.get(SeedCommand);
    await seedCommand.run();

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed', error);
  } finally {
    await app.close();
  }
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppDataSource } from './infrastructure/database/data-source';

async function bootstrap() {
  // Initialize Database and Run Migrations
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    await AppDataSource.runMigrations();
    console.log('Migrations executed successfully!');
  } catch (err) {
    console.error('Error during Data Source initialization', err);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('app.rabbitmq.url')],
      queue: configService.get<string>('app.rabbitmq.queue'),
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReadingProgressAppModule } from './reading-progress-app.module'; 
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.READING_PROGRESS_MICROSERVICE_PORT || 3003; 
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ReadingProgressAppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0', 
        port: +port,
      },
    },
  );
  await app.listen();
  Logger.log(`Reading Progress Microservice is listening on port ${port}`, 'Bootstrap');
}
bootstrap();
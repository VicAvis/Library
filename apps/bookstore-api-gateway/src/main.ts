//apps/bookstore-api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { BookstoreApiGatewayModule } from './bookstore-api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(BookstoreApiGatewayModule);
  app.enableCors();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

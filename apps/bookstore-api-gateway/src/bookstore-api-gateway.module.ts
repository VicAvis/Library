//apps/bookstore-api-gateway/src/bookstore-api-gateway.module.ts
import { Module } from '@nestjs/common';
import { BookstoreApiGatewayController } from './bookstore-api-gateway.controller';
import { BookstoreApiGatewayService } from './bookstore-api-gateway.service';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule as ApiGatewayUsersModule } from './users/users.module'; // user CRUD module in gateway
import { AuthModule as ApiGatewayAuthModule } from './auth/auth.module'; 
import { ClientsModule, Transport } from '@nestjs/microservices'; 

@Module({
  imports: [UsersModule, BooksModule, 
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: 'USERS_CLIENT',
        transport: Transport.TCP, 
        options: {
          host: 'localhost', 
          port: 3001,
        },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ApiGatewayUsersModule,
    ApiGatewayAuthModule,
  ],
  controllers: [BookstoreApiGatewayController],
  providers: [BookstoreApiGatewayService],
})
export class BookstoreApiGatewayModule {}

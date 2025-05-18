import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './books/books.module';
import { Book } from './books/entities/book.entity'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST_BOOKS', 'localhost'),
        port: +configService.get<number>('POSTGRES_PORT_BOOKS', 5434),
        username: configService.get<string>('POSTGRES_USER_BOOKS'),
        password: configService.get<string>('POSTGRES_PASSWORD_BOOKS'),
        database: configService.get<string>('POSTGRES_DB_BOOKS'),
        entities: [Book],
        synchronize: configService.get<string>('NODE_ENV', 'development') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    BooksModule, 
  ],
  controllers: [],
  providers: [],
})
export class BooksAppModule {}
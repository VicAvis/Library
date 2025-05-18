// apps/reading-progress/src/reading-progress-app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingProgressModule } from './reading-progress/reading-progress.module';
import { ReadingProgress } from './reading-progress/entities/reading-progress.entity';

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
        host: configService.get<string>('POSTGRES_HOST_READING'),
        port: +configService.get<number>('POSTGRES_PORT_READING', 5435),
        username: configService.get<string>('POSTGRES_USER_READING'),
        password: configService.get<string>('POSTGRES_PASSWORD_READING'),
        database: configService.get<string>('POSTGRES_DB_READING'),
        entities: [ReadingProgress],
        synchronize: configService.get<string>('NODE_ENV', 'development') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    ReadingProgressModule,
  ],
})
export class ReadingProgressAppModule {}

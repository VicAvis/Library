import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingProgress } from './entities/reading-progress.entity';
import { ReadingProgressService } from './reading-progress.service';
import { ReadingProgressController } from './reading-progress.controller';
import { ClientsModule, Transport } from '@nestjs/microservices'; 
import { ConfigModule, ConfigService } from '@nestjs/config';  
import { BOOKS_SERVICE_CLIENT } from '../constants';        

@Module({
  imports: [
    TypeOrmModule.forFeature([ReadingProgress]),
    ConfigModule, 
    ClientsModule.registerAsync([ 
      {
        name: BOOKS_SERVICE_CLIENT,
        imports: [ConfigModule], 
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('POSTGRES_HOST_BOOKS', 'localhost'),
            port: +configService.get<number>('BOOKS_CLIENT_PORT', 3002),  
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ReadingProgressService],
  controllers: [ReadingProgressController],
})
export class ReadingProgressModule {}
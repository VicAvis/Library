import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ReadingProgressService } from './reading-progress.service';
import { ReadingProgressController } from './reading-progress.controller';
import { READING_PROGRESS_CLIENT } from './reading-progress/constant';
import { ClientConfigModule } from '../books/client-config/client-config.module';
import { ClientConfigService } from '../books/client-config/client-config.service';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    ClientConfigModule, 
    AuthModule,       
  ],
  controllers: [ReadingProgressController],
  providers: [
    ReadingProgressService,
    {
      provide: READING_PROGRESS_CLIENT,
      useFactory: (configService: ClientConfigService) => {
        const clientOptions = configService.readingProgressClientOptions;
        return ClientProxyFactory.create(clientOptions);
      },
      inject: [ClientConfigService],
    },
  ],
})
export class ReadingProgressModule {}
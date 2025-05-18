// apps/bookstore-api-gateway/src/books/client-config/client-config.module.ts
import { Module } from "@nestjs/common";
import { ClientConfigService } from "./client-config.service";
import { ConfigModule } from "@nestjs/config";
import * as joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: false,
            validationSchema: joi.object({
                USERS_CLIENT_PORT: joi.number().default(3001),
                BOOKS_CLIENT_PORT: joi.number().default(3002),
                READING_PROGRESS_MICROSERVICE_PORT: joi.number().default(3003),
                READING_PROGRESS_MICROSERVICE_HOST: joi.string().default('localhost'), 
            }),
        }),
    ],
    providers: [ClientConfigService],
    exports: [ClientConfigService],
    
})
export class ClientConfigModule {}

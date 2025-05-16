import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { ClientOptions, Transport } from "@nestjs/microservices";

@Injectable()
export class ClientConfigService{
    constructor(private  config: ConfigService){}

    getBooksClientPort(): number {
        const port = this.config.get<number>('BOOKS_CLIENT_PORT');
        if (port === undefined) {
          throw new Error('BOOKS_CLIENT_PORT is not set in the environment');
        }
        return port;
      }

      getUsersClientPort(): number {
        const port = this.config.get<number>('USERS_CLIENT_PORT');
        if (port === undefined) {
          throw new Error('USERS_CLIENT_PORT is not set in the environment');
        }
        return port;
      }

    get booksClientOptions(): ClientOptions{
        return {
            transport: Transport.TCP,
            options: {
                port: this.getBooksClientPort(),
            },
        };
    }

    get usersClientOptions(): ClientOptions{
        return {
            transport: Transport.TCP,
            options: {
                port: this.getUsersClientPort(),
            },
        };
    }

}
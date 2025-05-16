// apps/users/src/app.module.ts
import { Module }         from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule }  from '@nestjs/typeorm';
import { UsersModule }    from './users.module';
import { AuthModule }     from './auth/auth.module';
import { User }           from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: cs => ({
        type: 'postgres',
        host: cs.get('POSTGRES_HOST_USERS', 'localhost'),
        port: +cs.get('POSTGRES_PORT_USERS', 5433),
        username: cs.get('POSTGRES_USER'),
        password: cs.get('POSTGRES_PASSWORD'),
        database: cs.get('POSTGRES_DB'),
        entities: [User],
        synchronize: cs.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}

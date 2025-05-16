// apps/bookstore-api-gateway/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'; 
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  email: string;
  sub: string;
  role:  'user' | 'admin';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET', 'fallback');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log(`JwtStrategy received decoded payload: ${JSON.stringify(payload)}`);

    if (!payload || !payload.sub || !payload.email || !payload.role) {
      console.log(`Invalid token payload structure or missing fields. Sub: ${payload?.sub}, Email: ${payload?.email}, Role: ${payload?.role}. Throwing UnauthorizedException.`);
      throw new UnauthorizedException('Invalid token payload.');
    }
    const typedPayload = payload as JwtPayload;

    console.log(`Token payload validated for user: ${typedPayload.email}, role: ${typedPayload.role}, sub: ${typedPayload.sub}`);
    return { userId: typedPayload.sub, email: typedPayload.email, role: typedPayload.role };
  }
}
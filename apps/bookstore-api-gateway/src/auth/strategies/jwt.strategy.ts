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

async validate(payload: JwtPayload): Promise<any> {
  console.log('API Gateway JwtStrategy validate method triggered. Payload:', payload);
  if (!payload || !payload.sub || !payload.email || !payload.role) { 
      console.log('Invalid payload in JWT Strategy:', payload);
      throw new UnauthorizedException('Invalid token payload from strategy.');
  }
  return { userId: payload.sub, email: payload.email, role: payload.role }; 
}
}


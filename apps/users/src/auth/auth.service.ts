// apps/users/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common'; 
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service';
import { compare } from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    console.log(`Validating user: ${email}`);
    const user = await this.usersService.findOneByEmailWithPassword(email);

    if (!user) {
      console.log(`User not found during validation: ${email}`);
      return null;
    }

    if (!user.password) {
      console.log(`User password missing during validation: ${email}`);
      return null;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      return null;
    }
    console.log(`User validated successfully: ${email}, Role: ${user.role}, ID: ${user.id}`);
    const { password: _, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>; 
  }

  async login(user: Omit<User, 'password'> & { id?: string; email?: string; role?: 'user' | 'admin' }): Promise<{ access_token: string }> {
    console.log(`Attempting to generate JWT. User details for payload: ID=${user.id}, Email=${user.email}, Role=${user.role}`);

    if (!user.id || !user.email || !user.role) {
      console.log(`ERROR: Missing id, email, or role for JWT generation. User Email: ${user.email}, ID: ${user.id}, Role: ${user.role}. This likely means data was not correctly fetched or passed to the login method.`);
      throw new InternalServerErrorException('Cannot generate token due to incomplete user data.');
    }

    const payload = {
      email: user.email,
      sub: user.id, 
      role: user.role,
    };

    console.log(`Payload to be signed for user ${user.email}: ${JSON.stringify(payload)}`);

    try {
      const access_token = this.jwtService.sign(payload);
      console.log(`JWT generated successfully for user: ${user.email}.`);
      return { access_token };
    } catch (error) {
      console.log(`Error signing JWT for user ${user.email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('JWT signing failed.'); 
    }
  }
}
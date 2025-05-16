//apps/users/src/auth/auth.controller.ts
import { Controller, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {

  constructor(private authService: AuthService) {}

  @MessagePattern('auth.login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async login(@Payload() loginDto: LoginDto) {
    console.log(`USERS_MS: Received login request for email: ${loginDto.email}`);
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        console.warn(`USERS_MS: Validation failed for user: ${loginDto.email}. Throwing RpcException.`);
        throw new RpcException({ status: 401, message: 'Invalid credentials' });
      }
      console.log(`USERS_MS: User validated: ${user.email}. Proceeding to login.`);
      return await this.authService.login(user);
    } catch (error) {
      console.error(`USERS_MS: Error during login process for ${loginDto.email}: ${error.message}`, error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ status: 500, message: error.message || 'Login process failed internally' });
    }
  }
}
//apps/bookstore-api-gateway/src/auth/auth.service.ts
import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { catchError, lastValueFrom, throwError,tap } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(@Inject('USERS_CLIENT') private usersClient: ClientProxy) {}

  private handleRpcError(error: any) {
    if (error instanceof RpcException || (error.name === 'RpcException' && error.message)) { 
        const rpcError = typeof error.getError === 'function' ? error.getError() : error;
        if (typeof rpcError === 'object' && rpcError !== null && 'status' in rpcError && 'message' in rpcError) {
            throw new HttpException(rpcError.message || 'Authentication failed.', rpcError.status || HttpStatus.UNAUTHORIZED);
        } else {
             throw new HttpException(rpcError.toString() || 'Authentication failed due to an unexpected error.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    throw new HttpException(error.message || 'An unexpected microservice error occurred during authentication.', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
}

async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    console.log('API_GATEWAY: Sending auth.login to USERS_CLIENT with DTO:', loginDto); 
    return lastValueFrom(
      this.usersClient
        .send('auth.login', loginDto)
        .pipe(
          tap(response => console.log('API_GATEWAY: Response from USERS_CLIENT for auth.login:', response)),
          catchError(err => {
            console.error('API_GATEWAY: Error from USERS_CLIENT for auth.login:', err); 
            return throwError(() => this.handleRpcError(err));
          })
        ),
    );
  }
}
// apps/bookstore-api-gateway/src/users/users.service.ts
import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto'; 
import { UpdateUserDto } from './dto/update-user.dto'; 
import { UserDto } from './dto/user.dto';
import { catchError, lastValueFrom, throwError } from 'rxjs';

@Injectable()
export class UsersService {
    constructor(@Inject('USERS_CLIENT') private usersClient: ClientProxy) {}

    private handleRpcError(error: any) {
        if (error instanceof RpcException) {
          const rpcError = error.getError();
      
          let status = HttpStatus.INTERNAL_SERVER_ERROR;
          let message = 'An unexpected error occurred.';
      
          if (typeof rpcError === 'object' && rpcError !== null) {
            if ('message' in rpcError) {
              message = rpcError.message as string;
            }
            if (typeof rpcError === 'object' && 'status' in rpcError && typeof rpcError.status === 'number') {
              status = rpcError.status;
            }
          }
      
          throw new HttpException(message, status);
        }
      
        throw new HttpException(
          error?.message || 'An unexpected microservice error occurred.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

    async create(createUserDto: CreateUserDto): Promise<UserDto> {
        return lastValueFrom(
            this.usersClient.send('users.create', createUserDto)
                .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
        );
    }

    async findAll(): Promise<UserDto[]> {
        return lastValueFrom(
            this.usersClient.send('users.findAll', {})
                .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
        );
    }

    async findOne(id: string): Promise<UserDto> {
        return lastValueFrom( // expecting the id directly in the payload for findOne
            this.usersClient.send('users.findOne', { id })
                .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
        );
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
        return lastValueFrom(
            this.usersClient.send('users.update', { id, updateUserDto })
                .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
        );
    }

    async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
         return lastValueFrom(
            this.usersClient.send('users.remove', { id })
                .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
        );
    }
}
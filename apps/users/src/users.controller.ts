// apps/users/src/users.controller.ts
import { Controller, UsePipes, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.create')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async create(@Payload() createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new RpcException(error); 
    }
  }

  @MessagePattern('users.findAll')
  async findAll(): Promise<UserDto[]> {
     try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('users.findOne')
  async findOne(@Payload('id') id: string): Promise<UserDto> {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('users.update')
  async update(@Payload() payload: { id: string; updateUserDto: UpdateUserDto }): Promise<UserDto> {
    try {
      const { id, updateUserDto } = payload;
      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('users.remove')
  async remove(@Payload('id') id: string): Promise<{ deleted: boolean; message?: string }> {
     try {
      return await this.usersService.remove(id);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
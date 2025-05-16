// apps/bookstore-api-gateway/src/users/users.controller.ts
import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UsePipes, ValidationPipe, ParseUUIDPipe, UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { Roles } from '../../../../libs/common/decorators/roles.decorator'; 
import { RolesGuard } from '../../../../libs/common/guards/roles.guard'; 

@Controller('users')
export class UsersController {

constructor(private readonly usersService: UsersService) {}

@Post()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
  return this.usersService.create(createUserDto);
}

@Get()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
findAll(): Promise<UserDto[]> {
  console.log('Attempting to find all users (admin only)');
  return this.usersService.findAll();
}

@Get(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Roles('user', 'admin') // both user and admin 
findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
  return this.usersService.findOne(id);
}

@Patch(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Roles('admin') //  only admin
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
update(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() updateUserDto: UpdateUserDto,
): Promise<UserDto> {
  return this.usersService.update(id, updateUserDto);
}

@Delete(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Roles('admin')
remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ deleted: boolean; message?: string }> {
  console.log(`Attempting to remove user ${id} (admin only)`);
  return this.usersService.remove(id);
}
}
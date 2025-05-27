// apps/users/src/users.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private mapToUserDto(user: User): UserDto {
    return new UserDto({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { email, password, ...restOfDto } = createUserDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    try {
      const user = this.usersRepository.create({
        email,
        password, // password will be hashed by @BeforeInsert in entity
        ...restOfDto,
      });
      const savedUser = await this.usersRepository.save(user);
      return this.mapToUserDto(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === '23505') { 
        throw new ConflictException('Email already exists.');
      }
      throw new InternalServerErrorException('Could not create user.');
    }
  }
  

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find();
    return users.map(user => this.mapToUserDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        throw new BadRequestException('Invalid UUID format for user ID.');
    }
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return this.mapToUserDto(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    console.log(`Attempting to find user by email (with password): ${email}`);
    const user = await this.usersRepository.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') 
      .getOne();

    if (user) {
      console.log(`User found by email: ${email}`);
    } else {
      console.log(`User not found by email: ${email}`);
    }
    return user;
  }
  
  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    console.log(`findOneByEmailWithPassword - Attempting to find user by email: ${email} and select essential fields including role and id.`);
    const user = await this.usersRepository.findOne({
      where: { email }, 
      select: ['id', 'email', 'password', 'role', 'firstName', 'lastName', 'age', 'createdAt', 'updatedAt']
    });

    if (user) {
      console.log(`findOneByEmailWithPassword - User found: ${user.email}, ID: ${user.id}, Role: ${user.role}`);
    } else {
      console.log(`findOneByEmailWithPassword - User not found with email: ${email}`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        throw new BadRequestException('Invalid UUID format for user ID.');
    }
    const user = await this.usersRepository.preload({
        id: id,
        ...updateUserDto,
    });

    if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    if (updateUserDto.password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    try {
        const updatedUser = await this.usersRepository.save(user);
        return this.mapToUserDto(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
         if (error.code === '23505') {
            throw new ConflictException('Email already exists.');
        }
        throw new InternalServerErrorException('Could not update user.');
    }
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        throw new BadRequestException('Invalid UUID format for user ID.');
    }
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return { deleted: true };
  }
}
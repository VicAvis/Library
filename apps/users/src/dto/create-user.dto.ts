// apps/users/src/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}
// apps/users/src/dto/user.dto.ts
export class UserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
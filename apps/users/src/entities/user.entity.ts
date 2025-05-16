// apps/users/src/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true }) 
  firstName?: string;

  @Column({ nullable: true }) 
  lastName?: string;

  @Column({ nullable: false, select: false }) 
  password?: string; 

  @Column({ nullable: true })
  age?: number;

  @Column({ type: 'enum', enum: ['user','admin'], default: 'user' })
  role: 'user' | 'admin';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    if (!this.password || !attempt) {
        console.error("Attempting to compare password but actual password or attempt is missing."); 
        return false;
    }
    console.log("Comparing provided password attempt with stored hash."); 
    return bcrypt.compare(attempt, this.password);
  }
}
import { IsEmail, IsStrongPassword } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../enums/role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  username: string;

  @Column({ unique: true, length: 40 })
  nickname: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  full_name?: string;

  @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers:1
  })
  @Column()
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
      enum: Role,
    default: Role.USER
  })
  role: Role;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  CreatedAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  UpdatedAt: Date;
}

/* 
id: string (UUID), 
username: string (length:50), 
nickname: string (length:40, unique), 
email: string (unique), 
full_name: string (nullable), 
password: string, 
avatar: string (nullable), 
role: enum (Role), 
CreatedAt: Date (timestamp), 
UpdatedAt: Date (timestamp, nullable)
*/
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  IsOptional,
  Length,
  IsEnum,
  isString,
} from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @Length(1, 50, { message: 'Username must be between 1 and 50 characters' })
  username: string;

  @IsString()
  @Length(1, 40, {
    message: 'Nickname must be between 1 and 40 characters and Unique',
  })
  nickname: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  /*@IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    },
    {
      message:
        'Password must be at least 8 characters long, with 1 uppercase letter and 1 number',
    },
  )*/
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

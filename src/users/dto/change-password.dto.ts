// src/users/dto/change-password.dto.ts

import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(4)
  currentPassword: string;

  @IsString()
  @MinLength(4)
  newPassword: string;
}

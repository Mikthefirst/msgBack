// dto/create-group.dto.ts
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateGroupConversationDto {
  @IsString()
  groupName: string;

  @IsString()
  groupNickname: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  groupAvatar?: string; // мы будем сохранять имя файла

  @IsOptional()
  @IsArray()
  participantIds?: string[]; // можно пустой []
}

import { IsUUID, IsOptional, IsString, Length } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  user2Id: string;
  @IsOptional()
  @IsString()
  @Length(1, 80)
  nickname?: string;
}

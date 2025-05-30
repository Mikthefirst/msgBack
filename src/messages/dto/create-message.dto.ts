// dto/create-message.dto.ts
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  conversationId: string;
  
  @IsString()
  content: string;

  @IsOptional()
  @IsIn(['text', 'image', 'file'])
  type?: 'text' | 'image' | 'file';

  @IsOptional()
  @IsString()
  fileUrl?: string;
  
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
// dto/create-message.dto.ts
export class CreateMessageDto {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  imageUrl?: string;
}

import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  create(createConversationDto: CreateConversationDto) {
    return 'This action adds a new conversation';
  }

  findAll() {
    return `This action returns all conversations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}


/*
Получить все беседы пользователя
const userId = 'user-uuid';
const conversations = await ConversationToUser.find({ 
  where: { user: { id: userId } },
  relations: ['conversation']
});

Получить последнее сообщение в беседе
const lastMessage = await Message.findOne({
  where: { conversation: { id: conversationId } },
  order: { timestamp: 'DESC' }
});*/

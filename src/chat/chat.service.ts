// chat.service.ts
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity'; 
import { Conversation } from 'src/conversations/entities/conversation.entity'; 
import { Repository } from 'typeorm';
import { msgType } from 'src/enums/msg.enum';

@Injectable()
export class ChatService {
  constructor(
    // Оборачиваем ChatGateway в forwardRef и @Inject
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,

    @InjectRepository(Message) private msgRepository: Repository<Message>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private convRepository: Repository<Conversation>,
  ) {}

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    type: msgType = msgType.TEXT,
  ) {
    const sender = await this.userRepository.findOneBy({ id: userId });
    if (!sender) throw new NotFoundException('Sender not found');

    const conversation = await this.convRepository.findOneBy({id: conversationId,});
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = this.msgRepository.create({
      sender,
      conversation,
      content,
      type: type, 
    });
    const saved = await this.msgRepository.save(message);
    this.chatGateway.sendMessageToRoom(conversationId, saved);
    return saved;
  }

  async sendCodeMessage(
    userId: string,
    conversationId: string,
    content: string,
  ) {
    const sender = await this.userRepository.findOneBy({ id: userId });
    if (!sender) throw new NotFoundException('Sender not found');

    const conversation = await this.convRepository.findOneBy({
      id: conversationId,
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = this.msgRepository.create({
      sender,
      conversation,
      content,
      type: msgType.code,
    });

    const saved = await this.msgRepository.save(message);

    this.chatGateway.sendMessageToRoom(conversationId, saved);

    return saved;
  }
}

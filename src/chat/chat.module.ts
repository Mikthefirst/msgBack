//chat.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User, Conversation])],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}

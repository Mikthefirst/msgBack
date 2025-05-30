import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './entities/conversation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationToUser } from './entities/conv-to-user.entity';
import { ConversationLastMessage } from './entities/lastmsg.entity';
import { UsersModule } from 'src/users/users.module';
import { Message } from 'src/messages/entities/message.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([ConversationToUser]),
    TypeOrmModule.forFeature([ConversationLastMessage]),
    TypeOrmModule.forFeature([Message]),
  ],
  exports: [TypeOrmModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}

import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { ConversationToUser } from 'src/conversations/entities/conv-to-user.entity';
import { ConversationLastMessage } from 'src/conversations/entities/lastmsg.entity';
import { Message } from 'src/messages/entities/message.entity';
import { UsersModule } from 'src/users/users.module';
import { ConversationsModule } from 'src/conversations/conversations.module';

@Module({
  imports: [UsersModule,
    ConversationsModule,
      TypeOrmModule.forFeature([Conversation]),
      TypeOrmModule.forFeature([ConversationToUser]),
      TypeOrmModule.forFeature([ConversationLastMessage]),
      TypeOrmModule.forFeature([Message]),],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

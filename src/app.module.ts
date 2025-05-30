import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { Conversation } from './conversations/entities/conversation.entity';
import { ConversationToUser } from './conversations/entities/conv-to-user.entity';
import { Message } from './messages/entities/message.entity';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { ImageServiceModule } from './image-service/image-service.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      password: process.env.DB_PASS,
      username: process.env.DB_USERNAME,
      database: process.env.DB_DATABASE,
      synchronize: true,
      logging: true,
      entities: [User, Message, Conversation, ConversationToUser],
    }),
    UsersModule,
    AuthModule,
    ConversationsModule,
    MessagesModule,
    ImageServiceModule,
    ChatModule,
  ],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}

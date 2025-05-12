import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
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
      entities: [User],
    }),
    UsersModule, AuthModule, ConversationsModule, MessagesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

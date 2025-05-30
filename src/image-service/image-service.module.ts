import { Module } from '@nestjs/common';
import { ImageServiceService } from './image-service.service';
import { ImageServiceController } from './image-service.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { ConversationToUser } from 'src/conversations/entities/conv-to-user.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Conversation,ConversationToUser]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [ImageServiceController],
  providers: [ImageServiceService],
})
export class ImageServiceModule {}



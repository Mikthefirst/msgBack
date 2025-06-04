import {
  BadRequestException, ForbiddenException,NotFoundException,
  Injectable} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Response } from 'express';
import { JwtUser } from 'src/types/userType';
import * as path from "path";
import { User } from "src/users/entities/user.entity";
import { Conversation } from "src/conversations/entities/conversation.entity";
import { ConversationToUser } from "src/conversations/entities/conv-to-user.entity";


@Injectable()
export class ImageServiceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,

    @InjectRepository(ConversationToUser)
    private readonly ctuRepo: Repository<ConversationToUser>,
  ) {}

  //
  //USERS
  //
  async handleFileUpload(file: Express.Multer.File, email) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let user: User = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new ForbiddenException('User not found');
    } else {
      await this.userRepository.update(
        { email },
        { avatar: file.filename }, // Store just the filename or full path if needed
      );
    }

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async sendAvatar(req, res) {
    const userReq: JwtUser = req.user;
    const user: User = await this.userRepository.findOne({
      where: { email: userReq.email },
    });
    if (!user.avatar) {
      throw new NotFoundException('couldnt find avatar');
    }
    const filePath = path.join(
      process.cwd(),
      'uploads/profileImage',
      user.avatar,
    );

    console.log(filePath);
    res.sendFile(filePath);
  }

  /**
   * Загружает файл для аватарки разговора (Conversation), проверяет, что пользователь в группе
   * и обновляет поле `groupAvatar` у Conversation
   */
  async handleConversationFileUpload(
    file: Express.Multer.File,
    conversationId: string,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // 1) Проверяем, что разговор существует
    const conversation = await this.convRepo.findOne({
      where: { id: conversationId },
      relations: ['createdBy'],
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    // 2) Проверяем, что текущий пользователь состоит в этом разговоре (или он создатель/админ)
    const rel = await this.ctuRepo.findOne({
      where: {
        conversation: { id: conversationId },
        user: { id: userId },
      },
    });
    if (!rel) {
      throw new ForbiddenException('You are not a member of this group/chat');
    }

    // (Дополнительно можно проверить `rel.isAdmin` или `conversation.createdBy.id === userId`
    //  чтобы только админ мог менять аватарку. Например:)
    // if (!rel.isAdmin && conversation.createdBy.id !== userId) {
    //   throw new ForbiddenException("Only admins can change group avatar");
    // }

    // 3) Сохраняем имя файла в поле `groupAvatar` у Conversation
    conversation.groupAvatar = file.filename;
    await this.convRepo.save(conversation);

    return {
      message: 'Conversation avatar uploaded successfully',
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Отправляет картинку-аватар для заданного conversationId
   */
  async sendConversationAvatar(conversationId: string, res: Response) {
    const conversation = await this.convRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation || !conversation.groupAvatar) {
      throw new NotFoundException('Conversation avatar not found');
    }

    const filePath = path.join(
      process.cwd(),
      'uploads/conversationImage',
      conversation.groupAvatar,
    );
    res.sendFile(filePath);
  }

  async handleMessageFileUpload(
    file: Express.Multer.File,
    conversationId: string,
    userId: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const conversation = await this.convRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isMember = await this.ctuRepo.findOne({
      where: {
        conversation: { id: conversationId },
        user: { id: userId },
      },
    });
    if (!isMember)
      throw new ForbiddenException('You are not a member of this conversation');

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/image-service/get-message-file/${file.filename}`,
    };
  }

  async sendMessageFile(filename: string, res: Response) {
    const filePath = path.join(process.cwd(), 'uploads/chat-content', filename);
    res.sendFile(filePath);
  }
}

/*
<img
  src={`/api/image-service/get-conversation-avatar/${conversationId}`}
  alt="Group avatar"
/>*/
import { msgType } from './../enums/msg.enum';
import { User } from '../users/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private msgRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private convRepository: Repository<Conversation>,
  ) {}

  /**
   * Возвращает сообщения для конкретной беседы с пагинацией.
   * @param conversationId — id беседы
   * @param skip — сколько сообщений пропустить (offset)
   * @param take — сколько сообщений вернуть (limit)
   */
  async getMessagesForConversation(
    conversationId: string,
    skip: number,
    take: number,
  ): Promise<Message[]> {
    const conversation = await this.convRepository.findOneBy({
      id: conversationId,
    });
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with id=${conversationId} not found`,
      );
    }

    // 2) Делаем запрос к репозиторию Message, чтобы вернуть нужный диапазон
    //    Предполагая, что в entity Message есть поле `conversation: Conversation`
    //    и поле `createdAt: Date` для сортировки по времени.
    const messages = await this.msgRepository.find({
      where: {
        conversation: { id: conversationId },
      },
      order: {
        'timestamp':"ASC"
      },
      skip,
      take,
      relations: ['sender'], // если нужно сразу подтянуть связанные User (отправителя)
    });

    return messages;
  }

  async addManyMsg(dtos: Array<CreateMessageDto & { userId: string }>) {
    try {
      const results = await Promise.all(
        dtos.map((dto) =>
          this.addMsg(dto.userId, {
            conversationId: dto.conversationId,
            content: dto.content,
            type: dto.type,
            fileUrl: dto.fileUrl,
            imageUrl: dto.imageUrl,
          }),
        ),
      );

      return {
        success: true,
        count: results.length,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async addMsg(userId: string, dto: CreateMessageDto) {
    const sender = await this.userRepository.findOneBy({ id: userId });
    if (!sender) throw new NotFoundException('Sender not found');

    const conversation = await this.convRepository.findOneBy({
      id: dto.conversationId,
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = this.msgRepository.create({
      sender,
      conversation,
      content: dto.content,
      type: msgType[dto.type.toUpperCase()] || msgType.TEXT,
      fileUrl: dto.fileUrl,
      imageUrl: dto.imageUrl,
    });

    return this.msgRepository.save(message).catch((reason) => reason);
  }
}

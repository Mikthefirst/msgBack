import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { ConversationToUser } from './entities/conv-to-user.entity';
import { User } from 'src/users/entities/user.entity';
import { randomUUID } from 'crypto';
import { Message } from 'src/messages/entities/message.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationToUser)
    private readonly ctuRepo: Repository<ConversationToUser>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
  ) {}

  async createDirectConversation(userId: string, dto: CreateChatDto) {
    try {
      console.log('userId: ', userId);
      console.log('dto: ', dto);
      const existing = await this.FindChatsBetweenUsers(userId, dto.user2Id);
      if (existing) {
        throw new ConflictException(
          'chat between this users have already existed',
        );
      }

      const user1 = await this.userRepo.findOneByOrFail({ id: userId });
      const user2 = await this.userRepo.findOneByOrFail({ id: dto.user2Id });

      //creation of chat
      const chat = this.convRepo.create({
        group_nickname: `${user1.nickname}-${user2.nickname}-${randomUUID().toString().slice(0, 4)}`,
        groupName: `${user1.nickname}*${user2.nickname}`,
        isGroup: false,
        createdBy: user1,
      });
      await this.convRepo.save(chat);

      //conv-to-usr
      await this.ctuRepo.save([
        this.ctuRepo.create({ user: user1, conversation: chat }),
        this.ctuRepo.create({ user: user2, conversation: chat }),
      ]);

      return chat;
    } catch (error) {
      if (error instanceof ConflictException)
        throw new ConflictException('U already have this chat');
      throw new BadRequestException('Problem occured with chat creation');
    }
  }

  async getConversation(
    userId: string,
  ) {

    const convToUsers = await this.ctuRepo.find({
      where: { user: { id: userId } },
      relations: ['conversation', 'conversation.createdBy'],
    });
    const conversations: any[] = [];
    for (const entry of convToUsers) {
      const conv = entry.conversation;
      const lastMessage = await this.msgRepo.findOne({
        where: { conversation: { id: conv.id } },
        order: { timestamp: 'DESC' },
        relations: ['sender'],
      });
      conversations.push({
        ...conv,
        createdBy: {
          username: conv.createdBy?.username,
          nickname: conv.createdBy?.nickname,
        },
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              type: lastMessage.type,
              fileUrl: lastMessage.fileUrl,
              imageUrl: lastMessage.imageUrl,
              timestamp: lastMessage.timestamp,
              sender: {
                username: lastMessage.sender?.username,
                nickname: lastMessage.sender?.nickname,
              },
            }
          : null,
      });
    }
    return conversations; 
  }

  //helpers
  async FindChatsBetweenUsers(
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation | null> {
    const convs1 = await this.ctuRepo.find({
      where: { user: { id: user1Id } },
      relations: ['conversation'],
    });

    const convs2 = await this.ctuRepo.find({
      where: { user: { id: user2Id } },
      relations: ['conversation'],
    });

    const user1Convs = convs1
      .map((c) => c.conversation)
      .filter((conv) => !conv.isGroup)
      .map((conv) => conv.id);

    const common = convs2.find(
      (c) => user1Convs.includes(c.conversation.id) && !c.conversation.isGroup,
    );

    return common?.conversation ?? null;
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

//conversation.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { In, Repository } from 'typeorm';
import { ConversationToUser } from './entities/conv-to-user.entity';
import { User } from 'src/users/entities/user.entity';
import { randomUUID } from 'crypto';
import { Message } from 'src/messages/entities/message.entity';
import { CreateGroupConversationDto } from './dto/create-group.dto';

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

  async getConversationMemberCount(conversationId: string): Promise<number> {
    try {
      const count = await this.ctuRepo.count({
        where: { conversation: { id: conversationId } },
      });
      return count;
    } catch (error) {
      console.error('Error counting conversation members:', error);
      throw new BadRequestException('Could not count conversation members');
    }
  }

  async getConversation(userId: string) {
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
          id: conv.createdBy.id,
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

  //GroupPage
  async checkIfUserIsAdmin(
    userId: string,
    conversationId: string,
  ): Promise<{ isAdmin: boolean }> {
    const rel = await this.ctuRepo.findOne({
      where: {
        user: { id: userId },
        conversation: { id: conversationId },
      },
    });

    return { isAdmin: rel?.isAdmin === true };
  }

  async getGroupParticipants(groupId: string) {
    const relations = await this.ctuRepo.find({
      where: { conversation: { id: groupId } },
      relations: ['user'],
    });

    return relations.map((rel) => ({
      id: rel.user.id,
      username: rel.user.username,
      nickname: rel.user.nickname,
      email: rel.user.email,
      full_name: rel.user.full_name,
      avatar: rel.user.avatar,
      role: rel.isAdmin ? 'admin' : 'user',
      joinedAt: rel.joinedAt,
      isAdmin: rel.isAdmin || false,
      isBlocked: rel.isBlocked || false,
    }));
  }

  async banUser(groupId: string, targetUserId: string, requesterId: string) {
    const requester = await this.ctuRepo.findOne({
      where: {
        conversation: { id: groupId },
        user: { id: requesterId },
      },
    });

    if (!requester?.isAdmin) {
      throw new ForbiddenException('Only admins can ban users');
    }

    const target = await this.ctuRepo.findOne({
      where: {
        conversation: { id: groupId },
        user: { id: targetUserId },
      },
    });

    if (!target) throw new NotFoundException('User is not in the group');

    target.isBlocked = true;
    return await this.ctuRepo.save(target);
  }

  async unbanUser(groupId: string, targetUserId: string, requesterId: string) {
    const requester = await this.ctuRepo.findOne({
      where: {
        conversation: { id: groupId },
        user: { id: requesterId },
      },
    });

    if (!requester?.isAdmin) {
      throw new ForbiddenException('Only admins can unban users');
    }

    const target = await this.ctuRepo.findOne({
      where: {
        conversation: { id: groupId },
        user: { id: targetUserId },
      },
    });

    if (!target) throw new NotFoundException('User is not in the group');

    target.isBlocked = false;
    return await this.ctuRepo.save(target);
  }

  async leaveGroup(groupId: string, userId: string) {
    const rel = await this.ctuRepo.findOne({
      where: {
        conversation: { id: groupId },
        user: { id: userId },
      },
    });

    if (!rel) throw new NotFoundException('User not in group');

    return await this.ctuRepo.remove(rel);
  }

  async makeAdmin(groupId: string, targetUserId: string, requesterId: string) {
    const requester = await this.ctuRepo.findOne({
      where: {
        conversation: { id: groupId },
        user: { id: requesterId },
      },
    });

    if (!requester?.isAdmin) {
      throw new ForbiddenException('Only admins can assign admin role');
    }

    const target = await this.ctuRepo.findOne({
      where: {
        conversation: { id: groupId },
        user: { id: targetUserId },
      },
    });

    if (!target) throw new NotFoundException('User not found');

    target.isAdmin = true;
    return await this.ctuRepo.save(target);
  }

  async getUsersWithDirectChats(userId: string): Promise<User[]> {
    const relations = await this.ctuRepo.find({
      where: { user: { id: userId } },
      relations: ['conversation', 'conversation.createdBy'],
    });

    const directConversations = relations
      .filter((r) => !r.conversation.isGroup)
      .map((r) => r.conversation.id);

    const convToUsers = await this.ctuRepo.find({
      where: {
        conversation: { id: In(directConversations) },
      },
      relations: ['user', 'conversation'],
    });

    const users = convToUsers
      .filter((rel) => rel.user.id !== userId)
      .map((rel) => rel.user);

    // Удалить дубликаты по id
    const uniqueUsers = Array.from(
      new Map(users.map((u) => [u.id, u])).values(),
    );

    return uniqueUsers;
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

  //image
  async createGroupConversation(
    creatorId: string,
    dto: CreateGroupConversationDto,
  ): Promise<Conversation> {
    const { groupName, groupNickname, groupAvatar, participantIds } = dto;

    // 1) Проверить, что у создателя валидный пользователь
    const creator = await this.userRepo.findOne({ where: { id: creatorId } });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // 2) Проверяем корректность participantIds (если массив не пуст)
    let participants: User[] = [];
    if (participantIds && participantIds.length > 0) {
      participants = await this.userRepo.findBy({ id: In(participantIds) });
      if (participants.length !== participantIds.length) {
        throw new BadRequestException('One or more participants not found');
      }
    }

    // 3) Создаём Conversation как группу
    const group = this.convRepo.create({
      group_nickname: groupNickname,
      groupName,
      groupAvatar: groupAvatar || null,
      isGroup: true,
      createdBy: creator,
    });
    const savedGroup = await this.convRepo.save(group);

    // 4) Формируем записи в ConversationToUser:
    //    - создатель (админ)
    //    - остальные участники (не админы)
    const allMembers = [creator, ...participants];
    const ctuEntities = allMembers.map((user) =>
      this.ctuRepo.create({
        user,
        conversation: savedGroup,
        isAdmin: user.id === creatorId,
      }),
    );
    await this.ctuRepo.save(ctuEntities);

    return savedGroup;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationToUser } from 'src/conversations/entities/conv-to-user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { ConversationsService } from 'src/conversations/conversations.service';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationToUser)
    private readonly ctuRepo: Repository<ConversationToUser>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
    private readonly conversationService: ConversationsService,
  ) {}

  async getAllGroups() {
    return this.convRepo.find({
      where: { isGroup: true },
      relations: ['createdBy'],
    });
  }

  async getGroupParticipants(groupId: string) {
    return this.conversationService.getGroupParticipants(groupId);
  }

  async getGroupMemberCount(groupId: string) {
    return this.conversationService.getConversationMemberCount(groupId);
  }

  async getGroupMessages(groupId: string) {
    return this.msgRepo.find({
      where: { conversation: { id: groupId } },
      relations: ['sender'],
      order: { timestamp: 'ASC' },
    });
  }
  async getNewGroups(since: Date): Promise<Conversation[]> {
    if (isNaN(since.getTime())) {
      throw new Error('Invalid date');
    }

    return this.convRepo.find({
      where: { CreatedAt: MoreThan(since) },
    });
  }

  async banGroup(groupId: string): Promise<{ message: string }> {
    const group = await this.convRepo.findOne({
      where: { id: groupId, isGroup: true },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    group.Banned = true;
    await this.convRepo.save(group);

    return {
      message: `Group ${group.groupName || group.group_nickname} has been banned.`,
    };
  }

  async UnbanGroup(groupId: string): Promise<{ message: string }> {
    const group = await this.convRepo.findOne({
      where: { id: groupId, isGroup: true },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    group.Banned = false;
    await this.convRepo.save(group);

    return {
      message: `Group ${group.groupName || group.group_nickname} has been unbanned.`,
    };
  }

  // === USERS ===

  async getAllUsers(): Promise<User[]> {
    return await this.userRepo.find({
      order: { CreatedAt: 'DESC' },
    });
  }

  async banUser(userId: string, reason: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    user.isBlocked = true;
    user.banReason = reason;
    await this.userRepo.save(user);

    return { message: `User ${user.nickname} has been banned.` };
  }

  async unbanUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    user.isBlocked = false;
    await this.userRepo.save(user);
    return { message: `User ${user.nickname} has been unbanned.` };
  }

  async makeUserAdmin(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    user.role = Role.ADMIN;
    await this.userRepo.save(user);
    return { message: `User ${user.nickname} is now an admin.` };
  }
}

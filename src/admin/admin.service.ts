import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationToUser } from 'src/conversations/entities/conv-to-user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { ConversationsService } from 'src/conversations/conversations.service';

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
}

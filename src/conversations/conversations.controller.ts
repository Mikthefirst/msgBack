import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get('for-user')
  async getConversations(@Req() req: any) {
    const conv = this.conversationsService.getConversation(req.user.id);
    return conv;
  }

  @Post('create-chat')
  async createDirect(@Body() dto: CreateChatDto, @Req() req: any) {
    return this.conversationsService.createDirectConversation(req.user.id, dto);
  }

  // Проверка — админ ли пользователь в группе
  @Get('/is-group-admin/:conversationId')
  async isAdmin(@Param('conversationId') id: string, @Req() req: any) {
    return this.conversationsService.checkIfUserIsAdmin(req.user.id, id);
  }

  // Получить всех участников группы
  @Get('/groups/:groupId/participants')
  async getGroupParticipants(@Param('groupId') groupId: string) {
    return this.conversationsService.getGroupParticipants(groupId);
  }

  // Заблокировать (забанить) пользователя в группе
  @Post('/groups/:groupId/ban/:userId')
  async banUser(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.conversationsService.banUser(groupId, userId, req.user.id);
  }

  // Выйти из группы
  @Delete('/groups/:groupId/leave')
  async leaveGroup(@Param('groupId') groupId: string, @Req() req: any) {
    return this.conversationsService.leaveGroup(groupId, req.user.id);
  }

  // Назначить пользователя админом
  @Post('/groups/:groupId/make-admin/:userId')
  async makeAdmin(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.conversationsService.makeAdmin(groupId, userId, req.user.id);
  }
}

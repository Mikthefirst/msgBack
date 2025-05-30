import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateChatDto } from './dto/create-chat.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateGroupConversationDto } from './dto/create-group.dto';
import { multerConversationConfig } from 'src/image-service/config/file-upload.conversation.config';

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

  @Post('create-group')
  @UseInterceptors(
    FileInterceptor('avatar', multerConversationConfig), // "avatar" = ключ в FormData
  )
  async createGroup(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateGroupConversationDto,
    @Req() req: any,
  ) {
    const creatorId = req.user.id;

    // Если файл пришёл, сохраняем имя в DTO
    if (file) {
      body.groupAvatar = file.filename;
    }

    return this.conversationsService.createGroupConversation(creatorId, body);
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
  @Patch('/groups/:groupId/ban/:userId')
  async banUser(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    console.log('ban user:', userId);
    return this.conversationsService.banUser(groupId, userId, req.user.id);
  }

  @Patch('/groups/:groupId/unban/:userId')
  async unbanUser(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    console.log('unban user:', userId);
    return this.conversationsService.unbanUser(groupId, userId, req.user.id);
  }

  // Выйти из группы
  @Delete('/groups/:groupId/leave')
  async leaveGroup(@Param('groupId') groupId: string, @Req() req: any) {
    return this.conversationsService.leaveGroup(groupId, req.user.id);
  }

  // Назначить пользователя админом
  @Patch('/groups/:groupId/make-admin/:userId')
  async makeAdmin(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.conversationsService.makeAdmin(groupId, userId, req.user.id);
  }

  @Get('direct-users')
  async getUsersWithDirectChats(@Req() req: any) {
    return this.conversationsService.getUsersWithDirectChats(req.user.id);
  }

  @Get(':id/member-count')
  async getMemberCount(@Param('id') conversationId: string) {
    return this.conversationsService.getConversationMemberCount(conversationId);
  }
}

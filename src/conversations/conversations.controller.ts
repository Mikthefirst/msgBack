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
    //console.log(conv);
    return conv;
  }

  @Post('create-chat')
  async createDirect(@Body() dto: CreateChatDto, @Req() req: any) {
    return this.conversationsService.createDirectConversation(req.user.id, dto);
  }
}

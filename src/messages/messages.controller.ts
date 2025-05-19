import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  //сделать query параметром, передавать насколько далеко ушли от старта первые 100(0-100 сообщений), потом 100-200, и т.д
  @Get()
  async getMessagesForConf() {}

  @Post('add-many')
  async sandMessages(
    @Body() dtos: Array<CreateMessageDto & { userId: string }>,
  ) {
    return this.messagesService.addManyMsg(dtos);
  }

  @Post('add')
  async sendMessage(@Body() dto: CreateMessageDto, @Req() req) {
    const userId: string = req.user?.id;

    return this.messagesService.addMsg(userId, dto);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Message } from './entities/message.entity';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * GET /messages/:conversationId?skip=0&take=100
   *   - conversationId  — id беседы
   *   - skip            — сколько сообщений пропустить (offset)
   *   - take            — сколько сообщений вернуть (limit)
   */
  @Get(':conversationId')
  async getMessagesForConf(
    @Param('conversationId') conversationId: string,
    @Query('skip') skipStr?: string,
    @Query('take') takeStr?: string,
  ): Promise<Message[]> {
    // Парсим skip/take и ставим дефолты
    const skip = skipStr ? parseInt(skipStr, 10) : 0;
    const take = takeStr ? parseInt(takeStr, 10) : 100;

    if (isNaN(skip) || skip < 0) {
      throw new BadRequestException('skip must be a non‑negative integer');
    }
    if (isNaN(take) || take <= 0) {
      throw new BadRequestException('take must be a positive integer');
    }

    return this.messagesService.getMessagesForConversation(
      conversationId,
      skip,
      take,
    );
  }

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

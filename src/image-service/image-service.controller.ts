import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
  Param,
} from "@nestjs/common";
import { ImageServiceService } from './image-service.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { multerConfig } from './config/file-upload.config';
import { JwtUser } from 'src/types/userType';
import { multerConversationConfig } from "./config/file-upload.conversation.config";


@Controller('image-service')
export class ImageServiceController {
  constructor(private readonly imageServiceService: ImageServiceService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const user: JwtUser = req.user;
    return this.imageServiceService.handleFileUpload(file, user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-avatar')
  async getAvatar(@Request() req, @Res() res) {
    return this.imageServiceService.sendAvatar(req, res);
  }

  // ===============================================
  // Аватарки для Conversation (групп/чатов)
  // ===============================================

  @UseGuards(JwtAuthGuard)
  @Post('upload-conversation-avatar/:conversationId')
  @UseInterceptors(FileInterceptor('file', multerConversationConfig))
  async uploadConversationAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    const user: JwtUser = req.user;
    return this.imageServiceService.handleConversationFileUpload(
      file,
      conversationId,
      user.id,
    );
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get-conversation-avatar/:conversationId')
  async getConversationAvatar(
    @Param('conversationId') conversationId: string,
    @Res() res,
  ) {
    console.log('req was');
    return this.imageServiceService.sendConversationAvatar(conversationId, res);
  }
}

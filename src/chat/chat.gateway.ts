// chat.gateway.ts

import { ForbiddenException, forwardRef, Inject, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { Message } from 'src/messages/entities/message.entity';
import { msgType } from 'src/enums/msg.enum';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  private userRooms: Map<string, string> = new Map();

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const prevRoom = this.userRooms.get(client.id);
    if (prevRoom) client.leave(prevRoom);
    this.userRooms.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractAccessToken(client: Socket): string | null {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const tokenCookie = cookies.find((c) => c.startsWith('access_token='));
    return tokenCookie?.split('=')[1] || null;
  }

  private verifyClientToken(client: Socket): any {
    const token = this.extractAccessToken(client);
    if (!token) throw new ForbiddenException('No token found');
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new ForbiddenException('Invalid or expired token');
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, conversationId: string) {
    const decodedToken = this.verifyClientToken(client);

    // Проверка доступа к разговору (заглушка, замени своей)
    const hasAccess = await this.chatService.userHasAccessToConversation(
      decodedToken.sub,
      conversationId,
    );
    if (!hasAccess) throw new ForbiddenException('Access denied to this room');

    const prevRoom = this.userRooms.get(client.id);
    if (prevRoom) client.leave(prevRoom);

    client.join(conversationId);
    this.userRooms.set(client.id, conversationId);

    this.logger.log(
      `User ${decodedToken.sub} joined room ${conversationId} (socket ${client.id})`,
    );
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, conversationId: string) {
    client.leave(conversationId);
    this.userRooms.delete(client.id);
    this.logger.log(`Client ${client.id} left room ${conversationId}`);
  }

  sendMessageToRoom(conversationId: string, message: Message) {
    console.log('resend message to room: ', message.content, " ", conversationId)
    this.server.to(conversationId).emit('new-message', {
      action: 'new-message',
      message,
    });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    client: Socket,
    payload: { userId: string; conversationId: string; content: string },
  ): Promise<void> {
    const decodedToken = this.verifyClientToken(client);
    const conversationId = this.userRooms.get(client.id);
    const { content } = payload;

    const savedMessage = await this.chatService.sendMessage(
      decodedToken.sub,
      conversationId,
      content,
    );

    this.sendMessageToRoom(conversationId, savedMessage);
  }

  @SubscribeMessage('send-message-code')
  async handleSendCodeMessage(
    client: Socket,
    payload: { conversationId: string; content: string },
  ): Promise<void> {
    const decodedToken = this.verifyClientToken(client);
    const { conversationId, content } = payload;

    const savedMessage = await this.chatService.sendCodeMessage(
      decodedToken.sub,
      conversationId,
      content,
    );

    this.sendMessageToRoom(conversationId, savedMessage);
  }

  @SubscribeMessage('send-message-status')
  async handleSendStatus(
    client: Socket,
    payload: { conversationId: string; content: string },
  ): Promise<void> {
    const decodedToken = this.verifyClientToken(client);
    const conversationId = this.userRooms.get(client.id);

    const savedMessage = await this.chatService.sendMessage(
      decodedToken.sub,
      conversationId,
      payload.content,
      msgType.status,
    );

    this.sendMessageToRoom(conversationId, savedMessage);
  }

  @SubscribeMessage('send-message-file')
  async handleSendFileMessage(
    client: Socket,
    payload: {
      conversationId: string;
      content: string;
      fileUrl: string;
      type: 'file' | 'image';
    },
  ): Promise<void> {
    const decodedToken = this.verifyClientToken(client);

    const savedMessage = await this.chatService.sendMessage(
      decodedToken.sub,
      payload.conversationId,
      payload.content,
      payload.type as msgType,
      payload.fileUrl,
    );

    this.sendMessageToRoom(payload.conversationId, savedMessage);
  }
}

// chat.gateway.ts
import { forwardRef, Inject } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Message } from 'src/messages/entities/message.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // allow frontend
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  private userRooms: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const prevRoom = this.userRooms.get(client.id);
    if (prevRoom) client.leave(prevRoom);
    this.userRooms.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, conversationId: string) {
    const prevRoom = this.userRooms.get(client.id);
    if (prevRoom) {
      client.leave(prevRoom);
    }

    client.join(conversationId);
    this.userRooms.set(client.id, conversationId);

    console.log(`Client ${client.id} joined room ${conversationId}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, conversationId: string) {
    client.leave(conversationId);
    this.userRooms.delete(client.id);

    console.log(`Client ${client.id} left room ${conversationId}`);
  }

  // Optional: Send message to room
  sendMessageToRoom(conversationId: string, message: any) {
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
    const { userId, content } = payload;
    const conversationId = this.userRooms.get(client.id);

    console.log("payload:",payload, "\nconvID:", conversationId)
    const savedMessage: Message = await this.chatService.sendMessage(
      userId,
      conversationId,
      content,
    );
  }
}
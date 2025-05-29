// chat.gateway.ts
import { ForbiddenException, forwardRef, Inject } from '@nestjs/common';
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
import { JwtService } from '@nestjs/jwt';


@WebSocketGateway({
  cors: {
    origin: '*', // allow frontend
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private jwtService: JwtService,
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
    try {
      const cookieHeader = client.handshake.headers.cookie;
      let accessToken = null;
      let tokenCookie, cookies;
      if (cookieHeader) {
        cookies = cookieHeader.split(';').map((c) => c.trim());
        tokenCookie = cookies.find((c) => c.startsWith('access_token='));

        if (tokenCookie) {
          accessToken = tokenCookie.split('=')[1];
        }
      }

      const decodedToken = this.jwtService.decode(accessToken);
      if (decodedToken) {
        const prevRoom = this.userRooms.get(client.id);
        if (prevRoom) {
          client.leave(prevRoom);
        }

        client.join(conversationId);
        this.userRooms.set(client.id, conversationId);
      }
     
    } catch (error) {
      new ForbiddenException("wrong token")
    }
    //console.log('join-room: ', client.handshake.headers.cookie);
  
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
    try {
      const cookieHeader = client.handshake.headers.cookie;
      let accessToken = null;
      let tokenCookie, cookies;
      if (cookieHeader) {
        cookies = cookieHeader.split(';').map((c) => c.trim());
        tokenCookie = cookies.find((c) => c.startsWith('access_token='));

        if (tokenCookie) {
          accessToken = tokenCookie.split('=')[1];
        }
      }

      const decodedToken = this.jwtService.decode(accessToken);
      if (decodedToken) {
       
        const { content } = payload;
        const conversationId = this.userRooms.get(client.id);

        console.log('payload:', payload, '\nconvID:', conversationId);
        const savedMessage: Message = await this.chatService.sendMessage(
          decodedToken.sub,
          conversationId,
          content,
        );
      
      }
    } catch (error) {
      new ForbiddenException('wrong token');
    }


    
  }
}
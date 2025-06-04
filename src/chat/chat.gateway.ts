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
import { msgType } from 'src/enums/msg.enum';


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
      new ForbiddenException('wrong token');
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
    console.log(
      `[handleSendMessage] client.id=${client.id}, payload.content="${payload.content}", time=${new Date().toISOString()}`,
    );
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

  @SubscribeMessage('send-message-code')
  async handleSendCodeMessage(
    client: Socket,
    payload: { conversationId: string; content: string },
  ): Promise<void> {
    console.log(
      `[handleSendCodeMessage] client.id=${client.id}, time=${new Date().toISOString()}`,
    );
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
        const { conversationId, content } = payload;

        const savedMessage: Message = await this.chatService.sendCodeMessage(
          decodedToken.sub,
          conversationId,
          content,
        );

        console.log('Saved code message:', savedMessage);
      }
    } catch (error) {
      throw new ForbiddenException('Invalid token for send-message-code');
    }
  }

  @SubscribeMessage('send-message-status')
  async handleSendStatus(
    client: Socket,
    payload: { conversationId: string; content: string },
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
        const conversationId = this.userRooms.get(client.id);
        const savedMessage = await this.chatService.sendMessage(
          decodedToken.sub,
          conversationId,
          payload.content,
          msgType.status, // тип "status"
        );
      }
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
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
    try {
      const cookieHeader = client.handshake.headers.cookie;
      let accessToken = null;

      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map((c) => c.trim());
        const tokenCookie = cookies.find((c) => c.startsWith('access_token='));
        if (tokenCookie) {
          accessToken = tokenCookie.split('=')[1];
        }
      }

      const decodedToken = this.jwtService.decode(accessToken);
      if (!decodedToken) throw new ForbiddenException('Invalid token');

      const userId = decodedToken.sub;
      const savedMessage = await this.chatService.sendMessage(
        userId,
        payload.conversationId,
        payload.content,
        payload.type as msgType,
        payload.fileUrl,
      );
      // Отправляем обратно участникам
      this.server.to(payload.conversationId).emit('new-message', savedMessage);
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('File message failed');
    }
  }
}
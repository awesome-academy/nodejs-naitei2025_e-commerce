import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: true,
    credentials: true
  }
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join-room')
  handleJoin(@MessageBody() body: { roomId: string }, @ConnectedSocket() client: Socket) {
    if (body?.roomId) {
      client.join(body.roomId);
    }
  }

  @SubscribeMessage('send-message')
  async handleSend(
    @MessageBody() body: { roomId: string; sender: string; content: string; userId?: string | null },
    @ConnectedSocket() client: Socket
  ) {
    if (!body?.roomId || !body?.content || !body?.sender) {
      return;
    }

    await this.chatService.ensureRoom(body.roomId, body.userId ?? null, 'active');
    const saved = await this.chatService.addMessage({
      roomId: body.roomId,
      sender: body.sender,
      content: body.content,
      userId: body.userId ?? null
    });

    this.server.to(body.roomId).emit('new-message', saved);
    client.emit('message-sent', saved);
  }
}

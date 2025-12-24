import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async rooms(@Query('limit') limit?: string) {
    const data = await this.chatService.getRooms(limit ? Number(limit) : 50);
    return { success: true, data };
  }

  @Post('rooms')
  async ensureRoom(@Body() body: { id: string; userId?: string; status?: string }) {
    await this.chatService.ensureRoom(body.id, body.userId ?? null, body.status ?? 'active');
    return { success: true };
  }

  @Get('rooms/:id/messages')
  async messages(@Param('id') id: string, @Query('limit') limit?: string) {
    const data = await this.chatService.getMessages(id, limit ? Number(limit) : 200);
    return { success: true, data };
  }

  @Post('rooms/:id/messages')
  async sendMessage(@Param('id') id: string, @Body() body: { sender: string; content: string; userId?: string }) {
    const data = await this.chatService.addMessage({
      roomId: id,
      sender: body.sender,
      content: body.content,
      userId: body.userId ?? null
    });
    return { success: true, data };
  }
}

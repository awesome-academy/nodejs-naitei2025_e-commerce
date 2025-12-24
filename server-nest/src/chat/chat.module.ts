import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}

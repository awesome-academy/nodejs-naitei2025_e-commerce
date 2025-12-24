import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChatService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getRooms(limit = 50) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async ensureRoom(id: string, userId?: string | null, status = 'active') {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('chat_rooms')
      .upsert({ id, user_id: userId ?? null, status }, { onConflict: 'id' });
    if (error) throw error;
  }

  async getMessages(roomId: string, limit = 200) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async addMessage(input: { roomId: string; sender: string; content: string; userId?: string | null }) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: input.roomId,
        sender: input.sender,
        content: input.content,
        user_id: input.userId ?? null
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}

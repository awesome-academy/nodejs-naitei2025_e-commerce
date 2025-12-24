import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

type ChatMessage = {
  id: string;
  room_id: string;
  sender: 'user' | 'admin';
  content: string;
  created_at: string;
};

const CHAT_LIMIT = 50;
const DEFAULT_ROOM_STATUS = 'active';

const createGuestId = () => {
  const existing = localStorage.getItem('chat_guest_id');
  if (existing) return existing;
  const id = `guest-${crypto.randomUUID?.() ?? Date.now().toString()}`;
  localStorage.setItem('chat_guest_id', id);
  return id;
};

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const roomId = useMemo(() => user?.id ?? createGuestId(), [user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(CHAT_LIMIT);

      if (fetchError) throw fetchError;
      setMessages((data as ChatMessage[]) ?? []);
    } catch (err) {
      console.error('Failed to load chat messages', err);
      setError('Không thể tải tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const ensureRoomExists = async () => {
    try {
      const { error: upsertError } = await supabase
        .from('chat_rooms')
        .upsert(
          {
            id: roomId,
            user_id: user?.id ?? null,
            status: DEFAULT_ROOM_STATUS
          },
          { onConflict: 'id' }
        );
      if (upsertError) throw upsertError;
    } catch (err) {
      console.error('Failed to create chat room', err);
      throw err;
    }
  };

  const subscribeRealtime = () => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          if (!open) setUnread((prev) => prev + 1);
        }
      );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    loadMessages();
    const unsubscribe = subscribeRealtime();
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      const timer = setTimeout(scrollToBottom, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open, messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content) return;
    setLoading(true);
    setError(null);
    try {
      await ensureRoomExists();
      const { error: insertError } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender: 'user',
        content,
        user_id: user?.id ?? null
      });
      if (insertError) throw insertError;
      setInput('');
    } catch (err) {
      console.error('Failed to send chat message', err);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-700 transition"
          >
            <MessageCircle size={20} />
            <span>Hỗ trợ</span>
            {unread > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-white text-red-600 text-xs font-semibold w-6 h-6">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        )}
      </div>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white rounded-xl shadow-2xl border flex flex-col"
             style={{ height: '380px' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <p className="font-semibold text-gray-900">Chat với người bán</p>
              <p className="text-xs text-gray-500">
                Một quản trị viên sẽ phản hồi sớm
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {loading && messages.length === 0 ? (
              <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-500">
                Chào bạn! Hãy để lại câu hỏi, người bán sẽ trả lời sớm.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-white border text-gray-900'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-3 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

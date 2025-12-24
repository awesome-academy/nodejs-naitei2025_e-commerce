import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, RefreshCw } from 'lucide-react';
import supabase from '../../services/supabaseClient';
import { useToast } from '../../contexts/ToastContext';

type ChatRoom = {
  id: string;
  user_id: string | null;
  status: string | null;
  created_at: string;
};

type ChatMessage = {
  id: string;
  room_id: string;
  sender: 'user' | 'admin';
  content: string;
  created_at: string;
};

const AdminChat: React.FC = () => {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setRooms((data as ChatRoom[]) ?? []);
      if (!selectedRoom && data && data.length > 0) {
        setSelectedRoom(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load chat rooms', err);
      showToast('error', 'Không tải được danh sách phòng chat');
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(200);
      if (error) throw error;
      setMessages((data as ChatMessage[]) ?? []);
      setTimeout(scrollToBottom, 150);
    } catch (err) {
      console.error('Failed to load chat messages', err);
      showToast('error', 'Không tải được tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    loadMessages(selectedRoom);
    const channel = supabase
      .channel(`admin-chat-${selectedRoom}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${selectedRoom}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
          setTimeout(scrollToBottom, 100);
        }
      );
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  const sendMessage = async () => {
    if (!selectedRoom || !input.trim()) return;
    const content = input.trim();
    setInput('');
    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: selectedRoom,
        sender: 'admin',
        content
      });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to send admin message', err);
      showToast('error', 'Không gửi được tin nhắn');
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <MessageCircle size={22} />
          <span>Chat với khách</span>
        </h1>
        <button
          onClick={loadRooms}
          className="flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
          disabled={loadingRooms}
        >
          <RefreshCw size={16} className={loadingRooms ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 border rounded-lg overflow-hidden" style={{ maxHeight: '70vh' }}>
          <div className="p-3 border-b font-semibold">Phòng chat</div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 48px)' }}>
            {loadingRooms && <p className="text-sm text-gray-500 p-3">Đang tải...</p>}
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`w-full text-left px-3 py-3 border-b hover:bg-gray-50 ${
                  selectedRoom === room.id ? 'bg-gray-100' : ''
                }`}
              >
                <p className="text-sm font-semibold truncate">{room.id}</p>
                <p className="text-xs text-gray-500">
                  {room.status ?? 'active'} •{' '}
                  {new Date(room.created_at).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </p>
              </button>
            ))}
            {rooms.length === 0 && !loadingRooms && (
              <p className="text-sm text-gray-500 p-3">Chưa có phòng chat</p>
            )}
          </div>
        </div>

        <div className="md:col-span-3 border rounded-lg flex flex-col" style={{ minHeight: '70vh', maxHeight: '70vh' }}>
          <div className="p-3 border-b">
            <p className="font-semibold">
              Phòng: {selectedRoom ? selectedRoom : 'Chưa chọn phòng'}
            </p>
            <p className="text-xs text-gray-500">
              Tin nhắn sẽ hiển thị realtime. Chọn phòng để trả lời khách.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {loadingMessages && <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>}
            {!loadingMessages && messages.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có tin nhắn</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    msg.sender === 'admin'
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
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Nhập tin nhắn trả lời khách..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              disabled={!selectedRoom}
            />
            <button
              onClick={sendMessage}
              disabled={!selectedRoom || !input.trim()}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;

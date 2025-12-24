# Chat widget (Supabase)

Frontend: `ChatWidget` sử dụng Supabase Realtime trên bảng `chat_messages`. Yêu cầu:

```sql
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id uuid references public.profiles(id),
  sender text not null check (sender in ('user','admin')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_room_idx on public.chat_messages (room_id, created_at);
```

- `room_id`: id người dùng (uuid) hoặc guest id (ví dụ `guest-...`).
- Admin có thể đọc toàn bộ, người dùng thường chỉ nên xem room của mình (RLS nếu bật).

Nếu bật RLS, ví dụ policy tối thiểu:
```sql
alter table public.chat_messages enable row level security;
create policy "users read own room" on public.chat_messages
  for select using (room_id = coalesce(auth.uid()::text, ''));
create policy "users insert own room" on public.chat_messages
  for insert with check (room_id = coalesce(auth.uid()::text, new.room_id));
```
Tùy chỉnh lại cho phù hợp mô hình admin.

Thông báo: hiện chưa gửi email/push; cần hook vào backend/Edge Function nếu muốn notify admin khi có tin nhắn mới. Chiều admin trả lời chỉ cần insert message với `sender='admin'` và đúng `room_id`.

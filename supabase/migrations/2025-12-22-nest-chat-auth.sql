begin;

alter table if exists public.profiles
  add column if not exists password_hash text,
  add column if not exists cart jsonb,
  add column if not exists wishlist jsonb;

create table if not exists public.chat_rooms (
  id text primary key,
  user_id uuid references public.profiles (id),
  status text default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.chat_rooms (id) on delete cascade,
  sender text not null check (sender in ('user','admin')),
  content text not null,
  user_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_room_idx on public.chat_messages (room_id);

commit;

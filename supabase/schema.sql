-- Consolidated schema for Supabase project
-- Run this once in the SQL Editor to create/patch supporting tables.

begin;

create extension if not exists "pgcrypto";

-- === Product enrichments ===
alter table if exists public.products
  add column if not exists stock int not null default 0,
  add column if not exists sold_count int not null default 0,
  add column if not exists last_inventory_audit timestamptz;

create index if not exists products_stock_idx on public.products (stock);

-- === Profiles & roles ===
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','editor','admin','viewer')),
  password_hash text,
  join_date timestamptz not null default now(),
  addresses jsonb,
  cart jsonb,
  wishlist jsonb,
  payment_methods jsonb,
  notifications jsonb,
  loyalty_points int not null default 0,
  tier text default 'Member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure profiles.id has a default even if table pre-existed without it.
alter table if exists public.profiles
  alter column id set default gen_random_uuid();

-- If profiles is linked to auth.users from previous Supabase auth usage, remove the FK for custom auth.
alter table if exists public.profiles
  drop constraint if exists profiles_id_fkey;

create index if not exists profiles_role_idx on public.profiles (role);

-- === Orders & Fulfillment ===
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address text,
  payment_method text not null default 'cod',
  status text not null default 'Chờ xử lý',
  note text,
  tracking_number text,
  source text not null default 'online',
  metadata jsonb default '{}'::jsonb,
  total numeric not null default 0,
  items_count int not null default 0,
  date timestamptz not null default now(),
  last_status_change timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_date_idx on public.orders (date desc);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text references public.products (id),
  product_name text not null,
  quantity int not null check (quantity > 0),
  price numeric not null default 0
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- === Inventory movements ===
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id) on delete cascade,
  change int not null,
  reason text,
  actor_id uuid references public.profiles (id),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_product_idx on public.inventory_movements (product_id);

-- === Admin activity logs ===
create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_actor_idx on public.admin_activity_logs (actor_id);

-- === Chat ===
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

-- === Utility functions & triggers ===
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.track_order_status()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.order_status_history (order_id, status, note, changed_by)
    values (new.id, new.status, new.note, null);
  elsif new.status is distinct from old.status then
    new.last_status_change = now();
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function public.update_product_stock_from_movement()
returns trigger as $$
begin
  update public.products
  set stock = greatest(0, stock + new.change)
  where id = new.product_id;

  if new.change < 0 then
    update public.products
    set sold_count = sold_count + abs(new.change)
    where id = new.product_id;
  end if;

  return new;
end;
$$ language plpgsql;

create or replace function public.log_admin_action(
  p_actor uuid,
  p_action text,
  p_entity text,
  p_entity_id text,
  p_metadata jsonb default '{}'::jsonb
) returns void as $$
begin
  insert into public.admin_activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (p_actor, p_action, p_entity, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

drop trigger if exists orders_track_status on public.orders;
create trigger orders_track_status
before insert or update on public.orders
for each row execute procedure public.track_order_status();

drop trigger if exists inventory_movements_apply_change on public.inventory_movements;
create trigger inventory_movements_apply_change
after insert on public.inventory_movements
for each row execute procedure public.update_product_stock_from_movement();

commit;

-- Migration: enrich admin data model (orders, profiles, inventory, logging)
-- Run this after deploying the initial Supabase schema.

begin;

create extension if not exists "pgcrypto";

alter table if exists public.products
  add column if not exists stock int not null default 0,
  add column if not exists sold_count int not null default 0,
  add column if not exists last_inventory_audit timestamptz;

alter table if exists public.profiles
  add column if not exists join_date timestamptz not null default now();

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now()
);

alter table if exists public.orders
  add column if not exists tracking_number text,
  add column if not exists source text not null default 'online',
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists last_status_change timestamptz not null default now();

alter table if exists public.order_items
  alter column price set default 0,
  add constraint order_items_positive_quantity check (quantity > 0);

alter table if exists public.inventory_movements
  add column if not exists metadata jsonb;

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

commit;

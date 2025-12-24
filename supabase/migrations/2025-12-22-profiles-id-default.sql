begin;

create extension if not exists "pgcrypto";

alter table if exists public.profiles
  alter column id set default gen_random_uuid();

commit;

begin;

alter table if exists public.profiles
  drop constraint if exists profiles_id_fkey;

commit;

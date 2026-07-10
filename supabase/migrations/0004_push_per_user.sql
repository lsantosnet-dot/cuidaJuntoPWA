-- CuidaJunto — Web Push subscriptions, keyed per user + device (not per circle).
-- Notifications target "all my circles": the sender joins memberships → these
-- rows by user_id. Safe to recreate: no subscriptions exist yet in production.

drop table if exists public.push_subscriptions cascade;

create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,                 -- Clerk user id
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index idx_push_user on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Each user manages only their own device subscriptions. The backend sender
-- uses the service role (bypasses RLS) to read them when notifying.
create policy push_select on public.push_subscriptions
  for select using (user_id = public.requesting_user_id());
create policy push_insert on public.push_subscriptions
  for insert with check (user_id = public.requesting_user_id());
create policy push_update on public.push_subscriptions
  for update using (user_id = public.requesting_user_id());
create policy push_delete on public.push_subscriptions
  for delete using (user_id = public.requesting_user_id());

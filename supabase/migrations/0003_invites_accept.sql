-- CuidaJunto — invite acceptance (multi-circle)
-- Adds a shareable token to invites and RPCs to preview + accept an invite,
-- so a user can join another person's care circle. Token-based (no email claim
-- needed in the JWT); the token is unguessable.

alter table public.invites
  add column if not exists token uuid not null default gen_random_uuid();

create unique index if not exists idx_invites_token on public.invites (token);

-- Preview an invite by token (used by the join screen before accepting).
-- SECURITY DEFINER so a not-yet-member can read just this invite's summary.
create or replace function public.get_invite(invite_token uuid)
returns table (circle_id uuid, circle_name text, role text, status text)
language sql
stable
security definer
set search_path = public
as $$
  select i.circle_id, c.name, i.role, i.status
  from public.invites i
  join public.care_circles c on c.id = i.circle_id
  where i.token = invite_token
$$;

-- Accept an invite: create the caller's membership and mark the invite accepted.
-- SECURITY DEFINER to bootstrap a membership RLS would otherwise block.
create or replace function public.accept_invite(invite_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := public.requesting_user_id();
  inv public.invites;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select * into inv from public.invites
  where token = invite_token and status = 'pending';

  if not found then
    raise exception 'invite not found or already used';
  end if;

  insert into public.memberships (circle_id, user_id, role)
  values (inv.circle_id, uid, inv.role)
  on conflict (circle_id, user_id) do nothing;

  update public.invites set status = 'accepted' where id = inv.id;

  return inv.circle_id;
end;
$$;

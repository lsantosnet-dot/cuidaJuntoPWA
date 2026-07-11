-- CuidaJunto — member profile fields
-- `create_care_circle` and `accept_invite` never captured display_name/email,
-- so real memberships end up with both null (shows as "?" in the team list).
-- Adds an avatar_url column and a self-service sync RPC the client calls on
-- load with the caller's current Clerk name/email/photo, backfilling existing
-- rows and keeping them fresh if the Clerk profile changes later.

alter table public.memberships add column if not exists avatar_url text;

create or replace function public.sync_member_profile(
  p_display_name text,
  p_email text,
  p_avatar_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := public.requesting_user_id();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  update public.memberships
  set display_name = nullif(p_display_name, ''),
      email        = nullif(p_email, ''),
      avatar_url   = nullif(p_avatar_url, '')
  where user_id = uid;
end;
$$;

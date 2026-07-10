-- CuidaJunto — Row Level Security
-- Identity comes from the Clerk JWT (`sub` claim), verified by Supabase via the
-- Clerk third-party auth integration. Access is scoped to circle membership.

-- Current Clerk user id, or null when unauthenticated.
create or replace function public.requesting_user_id()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '')
$$;

-- Membership checks run as SECURITY DEFINER to avoid recursive RLS on
-- `memberships` when a policy on another table needs to test membership.
create or replace function public.is_circle_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.circle_id = target
      and m.user_id = public.requesting_user_id()
  )
$$;

create or replace function public.is_circle_admin(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.circle_id = target
      and m.user_id = public.requesting_user_id()
      and m.role = 'admin'
  )
$$;

-- Atomically create a circle + the creator's admin membership (+ optional
-- recipient). SECURITY DEFINER so it can bootstrap the first membership, which
-- RLS would otherwise block.
create or replace function public.create_care_circle(circle_name text, recipient_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  uid    text := public.requesting_user_id();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.care_circles (name, created_by)
  values (coalesce(nullif(circle_name, ''), 'Meu círculo'), uid)
  returning id into new_id;

  insert into public.memberships (circle_id, user_id, role)
  values (new_id, uid, 'admin');

  if recipient_name is not null and recipient_name <> '' then
    insert into public.care_recipients (circle_id, name)
    values (new_id, recipient_name);
  end if;

  return new_id;
end;
$$;

-- Enable RLS everywhere.
alter table public.care_circles       enable row level security;
alter table public.memberships        enable row level security;
alter table public.care_recipients    enable row level security;
alter table public.medications        enable row level security;
alter table public.medication_logs    enable row level security;
alter table public.diary_entries      enable row level security;
alter table public.shifts             enable row level security;
alter table public.medical_records    enable row level security;
alter table public.invites            enable row level security;
alter table public.push_subscriptions enable row level security;

-- care_circles: members read; creator inserts; admins modify.
create policy care_circles_select on public.care_circles
  for select using (public.is_circle_member(id));
create policy care_circles_insert on public.care_circles
  for insert with check (created_by = public.requesting_user_id());
create policy care_circles_update on public.care_circles
  for update using (public.is_circle_admin(id));
create policy care_circles_delete on public.care_circles
  for delete using (public.is_circle_admin(id));

-- memberships: members read; admins manage (self-bootstrap goes through the RPC).
create policy memberships_select on public.memberships
  for select using (public.is_circle_member(circle_id));
create policy memberships_insert on public.memberships
  for insert with check (public.is_circle_admin(circle_id));
create policy memberships_update on public.memberships
  for update using (public.is_circle_admin(circle_id));
create policy memberships_delete on public.memberships
  for delete using (public.is_circle_admin(circle_id));

-- Care data tables: any circle member has full access within their circle.
-- (Same four-verb policy set, one table each.)
create policy care_recipients_all on public.care_recipients
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy medications_all on public.medications
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy medication_logs_all on public.medication_logs
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy diary_entries_all on public.diary_entries
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy shifts_all on public.shifts
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy medical_records_all on public.medical_records
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

-- invites: members read; admins manage.
create policy invites_select on public.invites
  for select using (public.is_circle_member(circle_id));
create policy invites_write on public.invites
  for all using (public.is_circle_admin(circle_id))
  with check (public.is_circle_admin(circle_id));

-- push_subscriptions: members read (needed to send); each user manages own rows.
create policy push_select on public.push_subscriptions
  for select using (public.is_circle_member(circle_id));
create policy push_insert on public.push_subscriptions
  for insert with check (
    public.is_circle_member(circle_id) and user_id = public.requesting_user_id()
  );
create policy push_update on public.push_subscriptions
  for update using (user_id = public.requesting_user_id());
create policy push_delete on public.push_subscriptions
  for delete using (user_id = public.requesting_user_id());

-- CuidaJunto — schema
-- Model: one care recipient per "care circle"; users join circles via
-- memberships. All identity ids are Clerk user ids (JWT `sub`), stored as text.

create extension if not exists pgcrypto;

-- Care circle: the shared space for one care recipient and their team.
create table if not exists public.care_circles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  text not null,                       -- Clerk user id
  created_at  timestamptz not null default now()
);

-- Membership: a user's role inside a circle.
create table if not exists public.memberships (
  id            uuid primary key default gen_random_uuid(),
  circle_id     uuid not null references public.care_circles(id) on delete cascade,
  user_id       text not null,                     -- Clerk user id
  role          text not null default 'family'
                  check (role in ('admin', 'family', 'caregiver')),
  display_name  text,
  email         text,
  created_at    timestamptz not null default now(),
  unique (circle_id, user_id)
);

-- The person being cared for. One per circle.
create table if not exists public.care_recipients (
  id          uuid primary key default gen_random_uuid(),
  circle_id   uuid not null unique references public.care_circles(id) on delete cascade,
  name        text not null,
  photo_url   text,
  birth_date  date,
  conditions  text[] not null default '{}',
  notes       text,
  updated_at  timestamptz not null default now()
);

-- Prescribed medications and their daily schedule.
create table if not exists public.medications (
  id              uuid primary key default gen_random_uuid(),
  circle_id       uuid not null references public.care_circles(id) on delete cascade,
  name            text not null,
  dosage          text,
  schedule_times  text[] not null default '{}',    -- e.g. {'08:00','20:00'}
  instructions    text,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- One row per scheduled dose; status tracks administration.
create table if not exists public.medication_logs (
  id             uuid primary key default gen_random_uuid(),
  circle_id      uuid not null references public.care_circles(id) on delete cascade,
  medication_id  uuid not null references public.medications(id) on delete cascade,
  scheduled_for  timestamptz not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'taken', 'skipped')),
  taken_at       timestamptz,
  taken_by       text,                             -- Clerk user id
  taken_by_name  text,
  created_at     timestamptz not null default now()
);

-- Care diary: free-text notes plus structured well-being fields.
create table if not exists public.diary_entries (
  id             uuid primary key default gen_random_uuid(),
  circle_id      uuid not null references public.care_circles(id) on delete cascade,
  author_id      text not null,                    -- Clerk user id
  author_name    text,
  content        text not null,
  sleep_quality  text check (sleep_quality in ('good', 'restless', 'interrupted')),
  appetite       text check (appetite in ('low', 'normal', 'high')),
  mood           text check (mood in ('great', 'ok', 'down', 'irritated', 'sleepy')),
  created_at     timestamptz not null default now()
);

-- On-duty schedule (shift roster).
create table if not exists public.shifts (
  id              uuid primary key default gen_random_uuid(),
  circle_id       uuid not null references public.care_circles(id) on delete cascade,
  caregiver_id    text,                            -- Clerk user id
  caregiver_name  text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  status          text not null default 'scheduled'
                    check (status in ('scheduled', 'active', 'ended')),
  notes           text,
  created_at      timestamptz not null default now()
);

-- Medical history: exams, appointments, documents.
create table if not exists public.medical_records (
  id              uuid primary key default gen_random_uuid(),
  circle_id       uuid not null references public.care_circles(id) on delete cascade,
  title           text not null,
  category        text not null default 'note'
                    check (category in ('exam', 'appointment', 'document', 'note')),
  record_date     date not null default current_date,
  details         text,
  attachment_url  text,
  created_at      timestamptz not null default now()
);

-- Pending invitations to join a circle.
create table if not exists public.invites (
  id          uuid primary key default gen_random_uuid(),
  circle_id   uuid not null references public.care_circles(id) on delete cascade,
  email       text not null,
  role        text not null default 'caregiver'
                check (role in ('admin', 'family', 'caregiver')),
  status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'revoked')),
  invited_by  text not null,                       -- Clerk user id
  created_at  timestamptz not null default now()
);

-- Web Push subscriptions, per user + device.
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  circle_id   uuid not null references public.care_circles(id) on delete cascade,
  user_id     text not null,                       -- Clerk user id
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- Indexes for the common "everything in my circle" access pattern.
create index if not exists idx_memberships_user       on public.memberships (user_id);
create index if not exists idx_memberships_circle      on public.memberships (circle_id);
create index if not exists idx_medications_circle      on public.medications (circle_id);
create index if not exists idx_med_logs_circle         on public.medication_logs (circle_id, scheduled_for);
create index if not exists idx_diary_circle            on public.diary_entries (circle_id, created_at desc);
create index if not exists idx_shifts_circle           on public.shifts (circle_id, starts_at);
create index if not exists idx_records_circle          on public.medical_records (circle_id, record_date desc);
create index if not exists idx_invites_circle          on public.invites (circle_id);
create index if not exists idx_push_circle             on public.push_subscriptions (circle_id);

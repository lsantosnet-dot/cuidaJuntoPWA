-- CuidaJunto — Divisão de custos entre membros do círculo
-- Money is stored in integer cents to avoid floating-point rounding drift.

-- Despesa lançada por um membro do círculo (remédios, fraldas, cuidador etc.).
create table if not exists public.cost_entries (
  id            uuid primary key default gen_random_uuid(),
  circle_id     uuid not null references public.care_circles(id) on delete cascade,
  description   text not null,
  category      text not null default 'other'
                  check (category in ('medication', 'diaper', 'caregiver', 'other')),
  amount_cents  integer not null check (amount_cents > 0),
  currency      text not null default 'BRL',
  expense_date  date not null default current_date,
  paid_by       text not null,                     -- Clerk user id de quem adiantou o dinheiro
  paid_by_name  text,
  split_type    text not null default 'equal'
                  check (split_type in ('equal', 'custom')),
  notes         text,
  created_by    text not null,
  created_at    timestamptz not null default now()
);

-- Quanto cada participante deve por uma despesa específica.
create table if not exists public.cost_shares (
  id             uuid primary key default gen_random_uuid(),
  cost_entry_id  uuid not null references public.cost_entries(id) on delete cascade,
  circle_id      uuid not null references public.care_circles(id) on delete cascade,
  user_id        text not null,
  user_name      text,
  share_cents    integer not null check (share_cents >= 0),
  created_at     timestamptz not null default now(),
  unique (cost_entry_id, user_id)
);

-- Registro manual de quitação entre dois membros (abate do saldo geral).
create table if not exists public.cost_settlements (
  id             uuid primary key default gen_random_uuid(),
  circle_id      uuid not null references public.care_circles(id) on delete cascade,
  from_user_id   text not null,                    -- quem pagou a dívida
  from_user_name text,
  to_user_id     text not null,                    -- quem recebeu
  to_user_name   text,
  amount_cents   integer not null check (amount_cents > 0),
  note           text,
  settled_at     timestamptz not null default now(),
  created_by     text not null,
  created_at     timestamptz not null default now()
);

create index if not exists idx_cost_entries_circle     on public.cost_entries (circle_id, expense_date desc);
create index if not exists idx_cost_shares_entry       on public.cost_shares (cost_entry_id);
create index if not exists idx_cost_shares_circle_user on public.cost_shares (circle_id, user_id);
create index if not exists idx_cost_settlements_circle on public.cost_settlements (circle_id, settled_at desc);

alter table public.cost_entries     enable row level security;
alter table public.cost_shares      enable row level security;
alter table public.cost_settlements enable row level security;

-- Same policy shape as the other "any circle member has full access" tables.
create policy cost_entries_all on public.cost_entries
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy cost_shares_all on public.cost_shares
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy cost_settlements_all on public.cost_settlements
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

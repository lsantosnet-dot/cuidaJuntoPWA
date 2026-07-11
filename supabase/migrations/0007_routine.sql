-- CuidaJunto — Rotina diária de cuidados (banho, alimentação, hidratação etc.)
-- Espelha medications/medication_logs, mas sem horário fixo: cada item tem uma
-- meta de vezes por dia e os logs são eventos de conclusão (não doses agendadas).

create table if not exists public.routine_items (
  id                    uuid primary key default gen_random_uuid(),
  circle_id             uuid not null references public.care_circles(id) on delete cascade,
  type                  text not null default 'other'
                          check (type in ('bath', 'meal', 'hydration', 'other')),
  name                  text not null,
  target_count_per_day  integer not null default 1 check (target_count_per_day > 0),
  notes                 text,
  active                boolean not null default true,
  created_at            timestamptz not null default now()
);

-- Um registro por conclusão (cada copo d'água, cada banho dado etc.).
create table if not exists public.routine_logs (
  id                 uuid primary key default gen_random_uuid(),
  circle_id          uuid not null references public.care_circles(id) on delete cascade,
  routine_item_id    uuid not null references public.routine_items(id) on delete cascade,
  log_date           date not null default current_date,
  completed_at       timestamptz not null default now(),
  completed_by       text not null,
  completed_by_name  text,
  created_at         timestamptz not null default now()
);

create index if not exists idx_routine_items_circle  on public.routine_items (circle_id);
create index if not exists idx_routine_logs_item_date on public.routine_logs (routine_item_id, log_date);
create index if not exists idx_routine_logs_circle    on public.routine_logs (circle_id, log_date desc);

alter table public.routine_items enable row level security;
alter table public.routine_logs  enable row level security;

create policy routine_items_all on public.routine_items
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy routine_logs_all on public.routine_logs
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

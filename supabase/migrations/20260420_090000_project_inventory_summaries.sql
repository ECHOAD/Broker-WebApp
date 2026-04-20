begin;

create table if not exists public.project_inventory_summaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  model_name text not null,
  lot_size_min_m2 numeric(12,2),
  lot_size_max_m2 numeric(12,2),
  habitable_area_m2 numeric(12,2),
  construction_area_m2 numeric(12,2),
  price_min numeric(14,2),
  price_max numeric(14,2),
  available_lots integer not null default 0,
  total_lots integer not null default 0,
  bedrooms integer,
  bathrooms numeric(4,1),
  status_note text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_inventory_lot_range check (
    lot_size_min_m2 is null
    or lot_size_max_m2 is null
    or lot_size_min_m2 <= lot_size_max_m2
  ),
  constraint project_inventory_price_range check (
    price_min is null
    or price_max is null
    or price_min <= price_max
  ),
  constraint project_inventory_counts check (
    available_lots >= 0
    and total_lots >= 0
    and available_lots <= total_lots
  )
);

create index if not exists idx_project_inventory_summaries_project_id
  on public.project_inventory_summaries(project_id, sort_order);

alter table public.project_inventory_summaries enable row level security;

drop policy if exists project_inventory_summaries_public_read on public.project_inventory_summaries;
create policy project_inventory_summaries_public_read on public.project_inventory_summaries
for select to anon, authenticated
using (
  is_active = true
  and (select private.is_public_project(project_id))
  or (select private.is_broker_admin())
);

drop policy if exists project_inventory_summaries_admin_write on public.project_inventory_summaries;
create policy project_inventory_summaries_admin_write on public.project_inventory_summaries
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

commit;

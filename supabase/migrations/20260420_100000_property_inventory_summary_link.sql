begin;

alter table public.properties
  add column if not exists inventory_summary_id uuid references public.project_inventory_summaries(id) on delete set null;

create index if not exists idx_properties_inventory_summary_id
  on public.properties(inventory_summary_id);

commit;

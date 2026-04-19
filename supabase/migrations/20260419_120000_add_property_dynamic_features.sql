begin;

alter table public.properties
  add column if not exists custom_features jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'properties_custom_features_is_array'
      and conrelid = 'public.properties'::regclass
  ) then
    alter table public.properties
      add constraint properties_custom_features_is_array
      check (jsonb_typeof(custom_features) = 'array');
  end if;
end
$$;

create index if not exists idx_properties_custom_features
  on public.properties using gin (custom_features);

commit;

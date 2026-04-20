alter type public.price_mode add value if not exists 'range';

alter table public.properties
  add column if not exists price_min_amount numeric(14,2),
  add column if not exists price_max_amount numeric(14,2),
  add column if not exists lot_area_min_m2 numeric(12,2),
  add column if not exists lot_area_max_m2 numeric(12,2);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'properties_price_range'
      and conrelid = 'public.properties'::regclass
  ) then
    alter table public.properties
      add constraint properties_price_range check (
        price_min_amount is null
        or price_max_amount is null
        or price_min_amount <= price_max_amount
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'properties_lot_area_range'
      and conrelid = 'public.properties'::regclass
  ) then
    alter table public.properties
      add constraint properties_lot_area_range check (
        lot_area_min_m2 is null
        or lot_area_max_m2 is null
        or lot_area_min_m2 <= lot_area_max_m2
      );
  end if;
end $$;

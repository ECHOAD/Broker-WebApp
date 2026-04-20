begin;

alter table public.properties
  drop constraint if exists properties_price_consistency;

alter table public.properties
  add constraint properties_price_consistency check (
    (
      price_mode = 'fixed'::public.price_mode
      and price_amount is not null
      and price_amount >= 0
    )
    or (
      price_mode = 'range'::public.price_mode
      and price_min_amount is not null
      and price_amount is not null
      and price_amount = price_min_amount
      and price_min_amount >= 0
      and (price_max_amount is null or price_max_amount >= price_min_amount)
    )
    or (
      price_mode = 'on_request'::public.price_mode
      and price_amount is null
      and price_min_amount is null
      and price_max_amount is null
    )
  );

update public.properties
set
  price_min_amount = coalesce(price_min_amount, price_amount),
  price_max_amount = coalesce(price_max_amount, price_amount)
where price_amount is not null
  and price_mode in ('fixed'::public.price_mode, 'range'::public.price_mode);

update public.properties
set
  lot_area_min_m2 = coalesce(lot_area_min_m2, lot_area_m2),
  lot_area_max_m2 = coalesce(lot_area_max_m2, lot_area_m2)
where lot_area_m2 is not null;

commit;

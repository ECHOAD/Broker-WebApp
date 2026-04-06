begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role' and typnamespace = 'public'::regnamespace) then
    create type public.app_role as enum ('broker_admin', 'client_user');
  end if;

  if not exists (select 1 from pg_type where typname = 'language_code' and typnamespace = 'public'::regnamespace) then
    create type public.language_code as enum ('es', 'en');
  end if;

  if not exists (select 1 from pg_type where typname = 'project_status' and typnamespace = 'public'::regnamespace) then
    create type public.project_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'listing_mode' and typnamespace = 'public'::regnamespace) then
    create type public.listing_mode as enum ('sale', 'rent', 'sale_rent');
  end if;

  if not exists (select 1 from pg_type where typname = 'property_status' and typnamespace = 'public'::regnamespace) then
    create type public.property_status as enum ('available', 'reserved', 'sold', 'rented', 'hidden');
  end if;

  if not exists (select 1 from pg_type where typname = 'price_mode' and typnamespace = 'public'::regnamespace) then
    create type public.price_mode as enum ('fixed', 'on_request');
  end if;

  if not exists (select 1 from pg_type where typname = 'lead_source' and typnamespace = 'public'::regnamespace) then
    create type public.lead_source as enum ('public_form', 'authenticated_interest', 'admin_manual');
  end if;

  if not exists (select 1 from pg_type where typname = 'lead_status' and typnamespace = 'public'::regnamespace) then
    create type public.lead_status as enum (
      'new',
      'contacted',
      'qualified',
      'meeting_requested',
      'meeting_scheduled',
      'negotiation',
      'closed_won',
      'closed_lost',
      'archived'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'closure_type' and typnamespace = 'public'::regnamespace) then
    create type public.closure_type as enum ('sale', 'rent');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'client_user',
  email text,
  full_name text,
  phone text,
  preferred_language public.language_code not null default 'es',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label_es text not null,
  label_en text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  headline text,
  summary text,
  description text,
  whatsapp_phone text,
  status public.project_status not null default 'draft',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  approximate_location_text text,
  approximate_latitude numeric(9,6),
  approximate_longitude numeric(9,6),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  property_type_id uuid not null references public.property_types(id) on delete restrict,
  slug text not null unique,
  title text not null,
  summary text,
  description text,
  listing_mode public.listing_mode not null,
  commercial_status public.property_status not null default 'available',
  price_mode public.price_mode not null default 'fixed',
  base_currency char(3) not null,
  price_amount numeric(14,2),
  bedrooms integer,
  bathrooms integer,
  parking_spaces integer,
  construction_area_m2 numeric(12,2),
  lot_area_m2 numeric(12,2),
  approximate_location_text text,
  approximate_latitude numeric(9,6),
  approximate_longitude numeric(9,6),
  whatsapp_phone text,
  is_featured boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_currency_uppercase check (base_currency = upper(base_currency)),
  constraint properties_price_consistency check (
    (price_mode = 'fixed' and price_amount is not null and price_amount >= 0)
    or (price_mode = 'on_request' and price_amount is null)
  )
);

create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_bucket text not null default 'property-media',
  storage_path text not null,
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table if not exists public.favorites (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, property_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  source public.lead_source not null default 'public_form',
  current_status public.lead_status not null default 'new',
  full_name text not null,
  email text,
  phone text not null,
  preferred_language public.language_code not null default 'es',
  budget_min numeric(14,2),
  budget_max numeric(14,2),
  budget_currency char(3),
  message text,
  meeting_interest boolean not null default false,
  consent_contact boolean not null default false,
  consent_privacy_version text,
  consent_source text,
  consent_captured_at timestamptz,
  source_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  last_whatsapp_redirect_at timestamptz,
  last_contacted_at timestamptz,
  is_duplicate boolean not null default false,
  duplicate_of_lead_id uuid references public.leads(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_budget_currency_uppercase check (budget_currency is null or budget_currency = upper(budget_currency)),
  constraint leads_budget_range check (
    budget_min is null or budget_max is null or budget_min <= budget_max
  )
);

create table if not exists public.lead_property_interests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  source_context text not null default 'contact',
  created_at timestamptz not null default now(),
  unique (lead_id, property_id)
);

create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  status public.lead_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table if not exists public.closures (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  closure_type public.closure_type not null,
  amount numeric(14,2),
  currency char(3),
  notes text,
  closed_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint closures_currency_uppercase check (currency is null or currency = upper(currency))
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  performed_by uuid references public.profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_property_types_active on public.property_types(is_active, sort_order);
create index if not exists idx_projects_status on public.projects(status, sort_order);
create index if not exists idx_projects_featured on public.projects(is_featured) where is_featured = true;
create index if not exists idx_properties_project_id on public.properties(project_id);
create index if not exists idx_properties_type_id on public.properties(property_type_id);
create index if not exists idx_properties_status on public.properties(commercial_status);
create index if not exists idx_properties_listing_mode on public.properties(listing_mode);
create index if not exists idx_properties_featured on public.properties(is_featured) where is_featured = true;
create index if not exists idx_property_media_property_id on public.property_media(property_id, sort_order);
create index if not exists idx_favorites_profile_id on public.favorites(profile_id);
create index if not exists idx_leads_profile_id on public.leads(profile_id);
create index if not exists idx_leads_status on public.leads(current_status, created_at desc);
create index if not exists idx_leads_duplicate_of on public.leads(duplicate_of_lead_id) where duplicate_of_lead_id is not null;
create index if not exists idx_leads_email_lower on public.leads(lower(coalesce(email, '')));
create index if not exists idx_leads_phone on public.leads(phone);
create index if not exists idx_lead_property_interests_lead on public.lead_property_interests(lead_id);
create index if not exists idx_lead_property_interests_property on public.lead_property_interests(property_id);
create index if not exists idx_lead_status_history_lead on public.lead_status_history(lead_id, changed_at desc);
create index if not exists idx_closures_lead on public.closures(lead_id);
create index if not exists idx_closures_property on public.closures(property_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);

create or replace function private.is_broker_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, private
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'broker_admin', false);
$$;

create or replace function private.is_public_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and p.status = 'published'
  );
$$;

create or replace function private.is_public_property(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.properties p
    where p.id = target_property_id
      and p.commercial_status <> 'hidden'
      and (
        p.project_id is null
        or private.is_public_project(p.project_id)
      )
  );
$$;

grant execute on function private.is_broker_admin() to anon, authenticated;
grant execute on function private.is_public_project(uuid) to anon, authenticated;
grant execute on function private.is_public_property(uuid) to anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public, private
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  requested_language text;
begin
  requested_language := coalesce(new.raw_user_meta_data ->> 'preferred_language', 'es');

  insert into public.profiles (id, email, full_name, preferred_language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when requested_language in ('es', 'en') then requested_language else 'es' end::public.language_code
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

create or replace function private.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = public, private
as $$
begin
  if new.role is distinct from old.role
     and current_user <> 'postgres'
     and not private.is_broker_admin() then
    raise exception 'Only broker admins can change profile roles';
  end if;

  return new;
end;
$$;

create or replace function private.log_lead_status_history()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if tg_op = 'INSERT' or new.current_status is distinct from old.current_status then
    insert into public.lead_status_history (lead_id, status, note, changed_by)
    values (
      new.id,
      new.current_status,
      null,
      coalesce(new.updated_by, new.created_by, new.profile_id)
    );
  end if;

  return new;
end;
$$;

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  actor uuid := auth.uid();
begin
  insert into public.audit_logs (entity_type, entity_id, action, performed_by, payload)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    actor,
    case
      when tg_op = 'INSERT' then jsonb_build_object('new', to_jsonb(new))
      when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
      else jsonb_build_object('old', to_jsonb(old))
    end
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

drop trigger if exists trg_profiles_prevent_role_change on public.profiles;
create trigger trg_profiles_prevent_role_change
before update on public.profiles
for each row
execute function private.prevent_profile_role_change();

drop trigger if exists trg_property_types_set_updated_at on public.property_types;
create trigger trg_property_types_set_updated_at
before update on public.property_types
for each row
execute function private.set_updated_at();

drop trigger if exists trg_projects_set_updated_at on public.projects;
create trigger trg_projects_set_updated_at
before update on public.projects
for each row
execute function private.set_updated_at();

drop trigger if exists trg_properties_set_updated_at on public.properties;
create trigger trg_properties_set_updated_at
before update on public.properties
for each row
execute function private.set_updated_at();

drop trigger if exists trg_leads_set_updated_at on public.leads;
create trigger trg_leads_set_updated_at
before update on public.leads
for each row
execute function private.set_updated_at();

drop trigger if exists trg_closures_set_updated_at on public.closures;
create trigger trg_closures_set_updated_at
before update on public.closures
for each row
execute function private.set_updated_at();

drop trigger if exists trg_leads_status_history on public.leads;
create trigger trg_leads_status_history
after insert or update of current_status on public.leads
for each row
execute function private.log_lead_status_history();

drop trigger if exists trg_projects_audit on public.projects;
create trigger trg_projects_audit
after insert or update or delete on public.projects
for each row
execute function private.audit_row_change();

drop trigger if exists trg_properties_audit on public.properties;
create trigger trg_properties_audit
after insert or update or delete on public.properties
for each row
execute function private.audit_row_change();

drop trigger if exists trg_leads_audit on public.leads;
create trigger trg_leads_audit
after insert or update or delete on public.leads
for each row
execute function private.audit_row_change();

drop trigger if exists trg_closures_audit on public.closures;
create trigger trg_closures_audit
after insert or update or delete on public.closures
for each row
execute function private.audit_row_change();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

insert into public.property_types (slug, label_es, label_en, sort_order)
values
  ('lot', 'Lote', 'Lot', 10),
  ('villa', 'Villa', 'Villa', 20),
  ('building', 'Edificio', 'Building', 30)
on conflict (slug) do update
  set label_es = excluded.label_es,
      label_en = excluded.label_en,
      sort_order = excluded.sort_order;

insert into storage.buckets (id, name, public)
values ('property-media', 'property-media', true)
on conflict (id) do update
  set public = excluded.public;

alter table public.profiles enable row level security;
alter table public.property_types enable row level security;
alter table public.projects enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.favorites enable row level security;
alter table public.leads enable row level security;
alter table public.lead_property_interests enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.closures enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert to authenticated
with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists property_types_public_read on public.property_types;
create policy property_types_public_read on public.property_types
for select to anon, authenticated
using (is_active = true or (select private.is_broker_admin()));

drop policy if exists property_types_admin_write on public.property_types;
create policy property_types_admin_write on public.property_types
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects
for select to anon, authenticated
using (status = 'published' or (select private.is_broker_admin()));

drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists properties_public_read on public.properties;
create policy properties_public_read on public.properties
for select to anon, authenticated
using (
  commercial_status <> 'hidden'
  and (
    project_id is null
    or (select private.is_public_project(project_id))
  )
  or (select private.is_broker_admin())
);

drop policy if exists properties_admin_write on public.properties;
create policy properties_admin_write on public.properties
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists property_media_public_read on public.property_media;
create policy property_media_public_read on public.property_media
for select to anon, authenticated
using (
  (select private.is_public_property(property_id))
  or (select private.is_broker_admin())
);

drop policy if exists property_media_admin_write on public.property_media;
create policy property_media_admin_write on public.property_media
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists favorites_admin_all on public.favorites;
create policy favorites_admin_all on public.favorites
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists favorites_select_own on public.favorites;
create policy favorites_select_own on public.favorites
for select to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own on public.favorites
for insert to authenticated
with check ((select auth.uid()) = profile_id);

drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own on public.favorites
for delete to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists leads_admin_all on public.leads;
create policy leads_admin_all on public.leads
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists leads_select_own on public.leads;
create policy leads_select_own on public.leads
for select to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists lead_interests_admin_all on public.lead_property_interests;
create policy lead_interests_admin_all on public.lead_property_interests
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists lead_interests_select_own on public.lead_property_interests;
create policy lead_interests_select_own on public.lead_property_interests
for select to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_id
      and l.profile_id = (select auth.uid())
  )
);

drop policy if exists lead_status_history_admin_all on public.lead_status_history;
create policy lead_status_history_admin_all on public.lead_status_history
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists lead_status_history_select_own on public.lead_status_history;
create policy lead_status_history_select_own on public.lead_status_history
for select to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_id
      and l.profile_id = (select auth.uid())
  )
);

drop policy if exists closures_admin_all on public.closures;
create policy closures_admin_all on public.closures
for all to authenticated
using ((select private.is_broker_admin()))
with check ((select private.is_broker_admin()));

drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
for select to authenticated
using ((select private.is_broker_admin()));

drop policy if exists property_media_storage_admin on storage.objects;
create policy property_media_storage_admin on storage.objects
for all to authenticated
using (bucket_id = 'property-media' and (select private.is_broker_admin()))
with check (bucket_id = 'property-media' and (select private.is_broker_admin()));

commit;

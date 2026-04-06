begin;

create or replace function private.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  requested_language text;
  derived_role public.app_role;
begin
  requested_language := coalesce(new.raw_user_meta_data ->> 'preferred_language', 'es');
  derived_role := case
    when coalesce(new.raw_app_meta_data ->> 'role', 'client_user') = 'broker_admin' then 'broker_admin'::public.app_role
    else 'client_user'::public.app_role
  end;

  insert into public.profiles (id, email, full_name, preferred_language, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when requested_language in ('es', 'en') then requested_language else 'es' end::public.language_code,
    derived_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        preferred_language = excluded.preferred_language,
        role = excluded.role,
        updated_at = now();

  return new;
end;
$$;

create or replace function private.bootstrap_first_broker_admin(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  already_has_admin boolean;
  target_exists boolean;
begin
  select exists(
    select 1
    from auth.users
    where coalesce(raw_app_meta_data ->> 'role', '') = 'broker_admin'
  ) into already_has_admin;

  if already_has_admin then
    raise exception 'A broker_admin already exists';
  end if;

  select exists(
    select 1
    from auth.users
    where id = target_user_id
  ) into target_exists;

  if not target_exists then
    raise exception 'Target auth user does not exist';
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'broker_admin')
  where id = target_user_id;

  update public.profiles
  set role = 'broker_admin',
      updated_at = now()
  where id = target_user_id;

  return jsonb_build_object(
    'user_id', target_user_id,
    'role', 'broker_admin',
    'token_refresh_required', true
  );
end;
$$;

revoke all on function private.bootstrap_first_broker_admin(uuid) from public, anon, authenticated;
revoke all on function private.sync_profile_from_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.sync_profile_from_auth_user();

drop trigger if exists on_auth_user_updated_profile_sync on auth.users;
create trigger on_auth_user_updated_profile_sync
after update of email, raw_user_meta_data, raw_app_meta_data on auth.users
for each row
execute function private.sync_profile_from_auth_user();

commit;

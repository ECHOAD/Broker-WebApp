begin;

create or replace function private.is_public_form_lead(target_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.leads l
    where l.id = target_lead_id
      and l.source = 'public_form'
      and l.profile_id is null
  );
$$;

grant execute on function private.is_public_form_lead(uuid) to anon, authenticated;

drop policy if exists leads_public_form_insert on public.leads;
create policy leads_public_form_insert on public.leads
for insert to anon, authenticated
with check (
  source = 'public_form'
  and current_status = 'new'
  and profile_id is null
  and created_by is null
  and updated_by is null
  and duplicate_of_lead_id is null
  and consent_contact = true
  and coalesce(length(btrim(full_name)), 0) >= 2
  and coalesce(length(btrim(phone)), 0) >= 7
  and (
    email is null
    or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
  and source_path like '/propiedades/%'
);

drop policy if exists lead_interests_public_form_insert on public.lead_property_interests;
create policy lead_interests_public_form_insert on public.lead_property_interests
for insert to anon, authenticated
with check (
  source_context = 'property_detail'
  and (select private.is_public_form_lead(lead_id))
  and (select private.is_public_property(property_id))
);

commit;

-- Run in Supabase SQL Editor if admin does not see new registrations.

alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pending boolean := coalesce((new.raw_user_meta_data->>'registration_source') = 'self-serve', false);
begin
  insert into public.profiles (id, full_name, email, role, approval_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'editor',
    case when pending then 'pending'::public.profile_approval_status else 'approved'::public.profile_approval_status end
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email);
  return new;
end;
$$;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and (p.email is null or p.email = '');

drop policy if exists "Owner admin update profiles" on public.profiles;
create policy "Owner admin update profiles"
  on public.profiles for update
  using (public.is_owner() or public.current_user_role() = 'admin')
  with check (public.is_owner() or public.current_user_role() = 'admin');

-- Primary owner (full CMS + approve registrations):
-- See docs/ENSURE_OWNER_ADMIN.sql for admin@m2mmedical.com

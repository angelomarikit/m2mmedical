-- Staff registration approval (admin accepts pending accounts).

create type public.profile_approval_status as enum ('pending', 'approved', 'rejected');

alter table public.profiles
  add column if not exists approval_status public.profile_approval_status not null default 'approved';

update public.profiles set approval_status = 'approved' where approval_status is null;

-- CMS access in the app still checks approval + role; RLS uses is_staff() = has a profile.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pending boolean := coalesce((new.raw_user_meta_data->>'registration_source') = 'self-serve', false);
begin
  insert into public.profiles (id, full_name, role, approval_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'editor',
    case when pending then 'pending'::public.profile_approval_status else 'approved'::public.profile_approval_status end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    approval_status = excluded.approval_status;
  return new;
end;
$$;

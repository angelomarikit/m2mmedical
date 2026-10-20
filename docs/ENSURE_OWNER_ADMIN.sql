-- Primary owner account for M2M Medical CMS (run once in Supabase SQL Editor if needed).

update public.profiles p
set
  role = 'owner',
  approval_status = 'approved',
  email = coalesce(p.email, u.email),
  full_name = coalesce(nullif(trim(p.full_name), ''), 'M2M Admin')
from auth.users u
where u.id = p.id
  and lower(u.email) = lower('admin@m2mmedical.com');

-- Verify (should show one row: role owner, approval_status approved):
-- select p.id, p.email, p.full_name, p.role, p.approval_status
-- from public.profiles p
-- join auth.users u on u.id = p.id
-- where lower(u.email) = lower('admin@m2mmedical.com');

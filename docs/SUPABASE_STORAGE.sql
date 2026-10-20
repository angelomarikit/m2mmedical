-- M2M Medical — Storage buckets + policies (SQL Editor only)
-- Dashboard → SQL Editor → New query → paste all → Run
--
-- Prerequisites: profiles + is_staff() from your main migrations
-- (approved owner/admin/editor can upload). Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1) Buckets (public read for images on the website)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('website-assets', 'website-assets', true),
  ('brand-logos', 'brand-logos', true),
  ('partner-client-logos', 'partner-client-logos', true),
  ('product-documents', 'product-documents', true)
on conflict (id) do update set public = excluded.public;

-- ---------------------------------------------------------------------------
-- 2) Storage policies on storage.objects
-- ---------------------------------------------------------------------------

-- product-images
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Staff upload product images" on storage.objects;
create policy "Staff upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "Staff update product images" on storage.objects;
create policy "Staff update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "Staff delete product images" on storage.objects;
create policy "Staff delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_staff());

-- website-assets (logo, hero, etc.)
drop policy if exists "Public read website assets" on storage.objects;
create policy "Public read website assets"
  on storage.objects for select
  using (bucket_id = 'website-assets');

drop policy if exists "Staff manage website assets" on storage.objects;
create policy "Staff manage website assets"
  on storage.objects for all
  using (bucket_id = 'website-assets' and public.is_staff())
  with check (bucket_id = 'website-assets' and public.is_staff());

-- brand-logos
drop policy if exists "Public read brand logos" on storage.objects;
create policy "Public read brand logos"
  on storage.objects for select
  using (bucket_id = 'brand-logos');

drop policy if exists "Staff manage brand logos" on storage.objects;
create policy "Staff manage brand logos"
  on storage.objects for all
  using (bucket_id = 'brand-logos' and public.is_staff())
  with check (bucket_id = 'brand-logos' and public.is_staff());

-- partner-client-logos
drop policy if exists "Public read partner logos" on storage.objects;
create policy "Public read partner logos"
  on storage.objects for select
  using (bucket_id = 'partner-client-logos');

drop policy if exists "Staff manage partner logos" on storage.objects;
create policy "Staff manage partner logos"
  on storage.objects for all
  using (bucket_id = 'partner-client-logos' and public.is_staff())
  with check (bucket_id = 'partner-client-logos' and public.is_staff());

-- product-documents
drop policy if exists "Public read product documents" on storage.objects;
create policy "Public read product documents"
  on storage.objects for select
  using (bucket_id = 'product-documents');

drop policy if exists "Staff manage product documents" on storage.objects;
create policy "Staff manage product documents"
  on storage.objects for all
  using (bucket_id = 'product-documents' and public.is_staff())
  with check (bucket_id = 'product-documents' and public.is_staff());

-- ---------------------------------------------------------------------------
-- 3) Quick check (optional — should return 5 rows)
-- ---------------------------------------------------------------------------
-- select id, name, public from storage.buckets
-- where id in (
--   'product-images', 'website-assets', 'brand-logos',
--   'partner-client-logos', 'product-documents'
-- );

-- Only needed if file upload says "Bucket not found" or permission denied.
-- Supabase → SQL Editor → paste → Run (safe to run more than once).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Staff upload product images" on storage.objects;
create policy "Staff upload product images" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "Staff update product images" on storage.objects;
create policy "Staff update product images" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "Staff delete product images" on storage.objects;
create policy "Staff delete product images" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_staff());

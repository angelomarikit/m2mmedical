-- RUN THIS IN SUPABASE SQL EDITOR (fixes “upload does nothing / no error” on draft products).
-- Safe to re-run.

-- 1) is_staff = has a profile (used by other tables)
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- 2) product_images: public site only sees published; LOGGED-IN admin sees everything
drop policy if exists "Public read images for published products" on public.product_images;
drop policy if exists "Staff manage product_images" on public.product_images;
drop policy if exists "Authenticated manage product_images" on public.product_images;
drop policy if exists "Anon read published product images" on public.product_images;
drop policy if exists "Authenticated all product_images" on public.product_images;

create policy "Anon read published product images"
  on public.product_images for select to anon
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'published'
    )
  );

create policy "Authenticated all product_images"
  on public.product_images for all to authenticated
  using (true)
  with check (true);

-- 3) products save (admin)
drop policy if exists "Staff manage products" on public.products;
create policy "Staff manage products"
  on public.products for all
  using (public.is_staff())
  with check (public.is_staff());

-- 4) storage bucket + uploads
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Staff upload product images" on storage.objects;
drop policy if exists "Staff update product images" on storage.objects;
drop policy if exists "Staff delete product images" on storage.objects;
drop policy if exists "Public read product images" on storage.objects;
drop policy if exists "Auth upload product images" on storage.objects;
drop policy if exists "Auth update product images" on storage.objects;
drop policy if exists "Auth delete product images" on storage.objects;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Auth upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images');

create policy "Auth update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images');

create policy "Auth delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images');

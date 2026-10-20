-- Ensure storage buckets exist (safe if initial migration already ran)
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('website-assets', 'website-assets', true),
  ('brand-logos', 'brand-logos', true),
  ('partner-client-logos', 'partner-client-logos', true),
  ('product-documents', 'product-documents', true)
on conflict (id) do update set public = excluded.public;

-- Editors can remove product images from storage (not only admins)
drop policy if exists "Staff delete product images" on storage.objects;
create policy "Staff delete product images" on storage.objects for delete using (
  bucket_id = 'product-images' and public.is_staff()
);

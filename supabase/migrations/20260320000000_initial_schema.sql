-- M2M Medical Trading — initial schema, RLS, storage

create extension if not exists "pgcrypto";

-- Roles
create type public.user_role as enum ('owner', 'admin', 'editor', 'sales');
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.inquiry_status as enum (
  'new', 'reviewing', 'contacted', 'quotation_sent', 'won', 'lost', 'closed'
);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helpers
create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin', 'editor', 'sales')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;

-- Brands
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_path text,
  website_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Collections
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.collections (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  cover_image_path text,
  seo_title text,
  seo_description text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index collections_parent_id_idx on public.collections (parent_id);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text,
  model_number text,
  brand_id uuid references public.brands (id) on delete set null,
  short_description text,
  description text,
  product_type text check (product_type in ('disposable', 'reusable', 'equipment')),
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  publicly_displayed_price numeric(12, 2),
  currency text default 'PHP',
  seo_title text,
  seo_description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_idx on public.products (status);
create index products_brand_id_idx on public.products (brand_id);

create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  primary key (product_id, collection_id)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false
);

create table public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  group_name text,
  label text not null,
  value text not null,
  sort_order int not null default 0,
  verification_status text not null default 'unverified'
    check (verification_status in ('verified', 'draft', 'unverified'))
);

create table public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  title text not null,
  storage_path text not null,
  file_type text
);

-- Inquiries
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique,
  inquiry_type text not null,
  full_name text not null,
  company_name text not null,
  email text not null,
  phone text not null,
  location text,
  message text,
  requested_delivery_date date,
  status public.inquiry_status not null default 'new',
  privacy_consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiry_items (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  model_snapshot text,
  quantity int not null check (quantity > 0)
);

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table public.service_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  email text not null,
  phone text not null,
  equipment_type text not null,
  equipment_model text,
  requested_service text not null,
  issue_description text not null,
  preferred_contact text default 'email',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- Content
create table public.site_settings (
  key text primary key,
  value_json jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  seo_title text,
  seo_description text,
  status text not null default 'published' check (status in ('draft', 'published'))
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  section_key text not null,
  section_type text not null default 'content',
  content_json jsonb not null default '{}',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  filename text not null,
  mime_type text,
  width int,
  height int,
  alt_text text,
  asset_category text,
  created_at timestamptz not null default now()
);

create table public.partners_clients (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('partner', 'client')),
  name text not null,
  logo_path text,
  website_url text,
  sort_order int not null default 0,
  is_published boolean not null default false
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Rate limiting for public submissions
create table public.submission_rate_limits (
  id uuid primary key default gen_random_uuid(),
  bucket_key text not null,
  created_at timestamptz not null default now()
);
create index submission_rate_limits_bucket_created_idx
  on public.submission_rate_limits (bucket_key, created_at desc);

-- Updated_at triggers
create trigger brands_updated before update on public.brands for each row execute function public.set_updated_at();
create trigger collections_updated before update on public.collections for each row execute function public.set_updated_at();
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();
create trigger inquiries_updated before update on public.inquiries for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_images enable row level security;
alter table public.product_specifications enable row level security;
alter table public.product_documents enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.contact_messages enable row level security;
alter table public.service_inquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.media_assets enable row level security;
alter table public.partners_clients enable row level security;
alter table public.activity_logs enable row level security;
alter table public.submission_rate_limits enable row level security;

-- Public read policies
create policy "Public read active brands" on public.brands for select using (is_active = true);
create policy "Public read published collections" on public.collections for select using (is_published = true);
create policy "Public read published products" on public.products for select using (status = 'published');
create policy "Public read product_collections for published" on public.product_collections for select using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
);
create policy "Anon read published product images" on public.product_images for select to anon using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
);
create policy "Authenticated all product_images" on public.product_images for all to authenticated using (true) with check (true);
create policy "Public read verified specs for published" on public.product_specifications for select using (
  verification_status = 'verified'
  and exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
);
create policy "Public read product documents for published" on public.product_documents for select using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
);
create policy "Public read published pages" on public.pages for select using (status = 'published');
create policy "Public read visible page sections" on public.page_sections for select using (
  is_visible = true
  and exists (select 1 from public.pages pg where pg.id = page_id and pg.status = 'published')
);
create policy "Public read published partners clients" on public.partners_clients for select using (is_published = true);

-- Staff policies (simplified: staff can manage catalog; sales read inquiries)
create policy "Staff read profiles" on public.profiles for select using (public.is_staff() or auth.uid() = id);
create policy "Owner update roles" on public.profiles for update using (public.is_owner()) with check (
  public.is_owner() and (role <> 'owner' or auth.uid() = id)
);

create policy "Staff manage brands" on public.brands for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() in ('admin', 'editor'));
create policy "Staff manage collections" on public.collections for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() in ('admin', 'editor'));
create policy "Staff manage products" on public.products for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() in ('admin', 'editor'));
create policy "Staff manage product_collections" on public.product_collections for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() in ('admin', 'editor'));
create policy "Staff manage product_specifications" on public.product_specifications for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() in ('admin', 'editor'));
create policy "Staff manage product_documents" on public.product_documents for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() in ('admin', 'editor'));
create policy "Staff read media" on public.media_assets for select using (public.is_staff());
create policy "Staff manage media" on public.media_assets for all using (public.is_admin() or public.current_user_role() = 'editor') with check (public.is_admin() or public.current_user_role() = 'editor');
create policy "Staff manage partners" on public.partners_clients for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() = 'editor');
create policy "Staff manage pages" on public.pages for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() = 'editor');
create policy "Staff manage page_sections" on public.page_sections for all using (public.is_staff()) with check (public.is_admin() or public.current_user_role() = 'editor');
create policy "Staff manage site_settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "Staff read inquiries" on public.inquiries for select using (public.is_staff());
create policy "Staff update inquiries" on public.inquiries for update using (public.is_staff()) with check (public.is_staff());
create policy "Staff read inquiry_items" on public.inquiry_items for select using (public.is_staff());
create policy "Staff manage inquiry_notes" on public.inquiry_notes for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff read contact_messages" on public.contact_messages for select using (public.is_staff());
create policy "Staff update contact_messages" on public.contact_messages for update using (public.is_staff());
create policy "Staff read service_inquiries" on public.service_inquiries for select using (public.is_staff());
create policy "Staff update service_inquiries" on public.service_inquiries for update using (public.is_staff());
create policy "Staff read activity_logs" on public.activity_logs for select using (public.is_admin());
create policy "Staff insert activity_logs" on public.activity_logs for insert with check (public.is_staff());

-- No public direct insert on inquiry tables (edge functions use service role)
create policy "Deny public inquiries" on public.inquiries for insert with check (false);
create policy "Deny public inquiry_items" on public.inquiry_items for insert with check (false);
create policy "Deny public contact" on public.contact_messages for insert with check (false);
create policy "Deny public service" on public.service_inquiries for insert with check (false);
create policy "Deny all rate limits public" on public.submission_rate_limits for all using (false);

-- Storage buckets (run in dashboard or via storage API)
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('website-assets', 'website-assets', true),
  ('brand-logos', 'brand-logos', true),
  ('partner-client-logos', 'partner-client-logos', true),
  ('product-documents', 'product-documents', true)
on conflict (id) do nothing;

create policy "Public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Staff upload product images" on storage.objects for insert with check (
  bucket_id = 'product-images' and public.is_staff()
);
create policy "Staff update product images" on storage.objects for update using (bucket_id = 'product-images' and public.is_staff());
create policy "Staff delete product images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

create policy "Public read website assets" on storage.objects for select using (bucket_id = 'website-assets');
create policy "Staff manage website assets" on storage.objects for all using (bucket_id = 'website-assets' and public.is_staff()) with check (public.is_staff());

create policy "Public read brand logos" on storage.objects for select using (bucket_id = 'brand-logos');
create policy "Staff manage brand logos" on storage.objects for all using (bucket_id = 'brand-logos' and public.is_staff()) with check (public.is_staff());

create policy "Public read partner logos" on storage.objects for select using (bucket_id = 'partner-client-logos');
create policy "Staff manage partner logos" on storage.objects for all using (bucket_id = 'partner-client-logos' and public.is_staff()) with check (public.is_staff());

create policy "Public read product documents" on storage.objects for select using (bucket_id = 'product-documents');
create policy "Staff manage product documents" on storage.objects for all using (bucket_id = 'product-documents' and public.is_staff()) with check (public.is_staff());

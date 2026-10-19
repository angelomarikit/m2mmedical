-- Allow anonymous visitors to read site settings (company, SEO, branding) configured in admin UI.
create policy "Public read site_settings"
  on public.site_settings
  for select
  using (true);

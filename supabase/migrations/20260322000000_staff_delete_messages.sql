-- Allow staff to remove inquiries and message records from the admin panel.
create policy "Staff delete inquiries"
  on public.inquiries
  for delete
  using (public.is_staff());

create policy "Staff delete inquiry_items"
  on public.inquiry_items
  for delete
  using (public.is_staff());

create policy "Staff delete contact_messages"
  on public.contact_messages
  for delete
  using (public.is_staff());

create policy "Staff delete service_inquiries"
  on public.service_inquiries
  for delete
  using (public.is_staff());

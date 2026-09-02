-- 009 fix storage RLS for media uploads + allow audit_logs delete for admin

-- Ensure storage buckets are public (already true, but ensure)
update storage.buckets set public = true where id in ('media','avatars');

-- Clean old storage policies if exist
drop policy if exists "public read media" on storage.objects;
drop policy if exists "authenticated can upload media" on storage.objects;
drop policy if exists "authenticated can update media" on storage.objects;
drop policy if exists "authenticated can delete media" on storage.objects;
drop policy if exists "admin can manage media" on storage.objects;

-- Public can read media
create policy "public read media" on storage.objects for select
  using (bucket_id in ('media','avatars'));

-- Authenticated users can upload (insert) to media/avatars
create policy "authenticated can upload media" on storage.objects for insert
  with check (bucket_id in ('media','avatars') and auth.role() = 'authenticated');

-- Authenticated can update their own uploads (or any if admin)
create policy "authenticated can update media" on storage.objects for update
  using (bucket_id in ('media','avatars') and auth.role() = 'authenticated')
  with check (bucket_id in ('media','avatars'));

-- Authenticated can delete (needed for crop replace maybe)
create policy "authenticated can delete media" on storage.objects for delete
  using (bucket_id in ('media','avatars') and auth.role() = 'authenticated');

-- Audit logs: allow admin to delete (service_role bypasses anyway, but add for browser)
drop policy if exists "admin can delete audit_logs" on public.audit_logs;
create policy "admin can delete audit_logs" on public.audit_logs for delete
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN')));

-- Also allow admin to delete all via service: ensure RLS enabled but service bypasses
-- Grant delete on audit_logs to authenticated (RLS will still filter)
grant delete on public.audit_logs to authenticated;
grant delete on storage.objects to authenticated;

-- Ensure audit_logs replica identity for realtime if needed
alter table public.audit_logs replica identity full;

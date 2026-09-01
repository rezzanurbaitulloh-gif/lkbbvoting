-- 008 fix infinite recursion in profiles RLS introduced by 006
-- Drop the recursive admin policy on profiles that queries itself

drop policy if exists "admin can read all profiles" on public.profiles;

-- Ensure public read remains (already true) — keep simple
-- If missing, recreate
drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select using (true);

-- Also fix notifications admin policy to avoid recursion? Keep but ensure it doesn't cause infinite via profiles
-- The recursion is on profiles itself, not notifications. So after dropping profiles recursive policy, notifications admin check will work.

-- Also ensure other admin policies that query profiles use a non-recursive pattern:
-- Keep them but they will now work because profiles public read is true without self-query.

-- For safety, recreate transactions/supports admin policies without recursion? They are okay because they query profiles, but profiles is now simple true.
drop policy if exists "admin can read transactions" on public.transactions;
create policy "admin can read transactions" on public.transactions for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

drop policy if exists "admin can read supports" on public.supports;
create policy "admin can read supports" on public.supports for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

drop policy if exists "admin can read notifications" on public.notifications;
create policy "admin can read notifications" on public.notifications for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

-- Also keep audit_logs admin
drop policy if exists "admin can read audit_logs" on public.audit_logs;
create policy "admin can read audit_logs" on public.audit_logs for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

-- Cleanup test notification from earlier (optional)
delete from public.notifications where supporter_name = 'Budi' and peleton_slug = 'smkn-1-kertosono';

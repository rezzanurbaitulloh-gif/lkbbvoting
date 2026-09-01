-- 006 allow admin to read all transactions and supports (for dashboard & riwayat)
-- Existing policy: users can read own transactions/supports via auth.uid() = user_id
-- Add admin bypass: if role in ADMIN/SUPER_ADMIN, allow read all

drop policy if exists "admin can read transactions" on public.transactions;
create policy "admin can read transactions" on public.transactions for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

drop policy if exists "admin can read supports" on public.supports;
create policy "admin can read supports" on public.supports for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

-- Also allow admin to read profiles for user counts (already public, but ensure)
drop policy if exists "admin can read all profiles" on public.profiles;
create policy "admin can read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ADMIN','SUPER_ADMIN'))
  or true -- keep public read (existing policy "public read profiles" already true, this is just extra)
);

-- Ensure team_ranking is readable by anon (for public klasemen) - already granted, keep
grant select on public.team_ranking to anon, authenticated, service_role;

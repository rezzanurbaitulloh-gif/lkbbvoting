-- 015_fix_profiles_rls_recursion.sql
-- Fix infinite recursion in profiles RLS that broke login via anon (public_name lookup)

-- Drop the problematic policy that queried profiles itself
drop policy if exists "admin can read all profiles" on public.profiles;

-- Ensure public read remains (true) for login lookup and general display
do $$
begin
  if not exists (select 1 from pg_policies where policyname='public read profiles' and tablename='profiles') then
    create policy "public read profiles" on public.profiles for select using (true);
  end if;
exception when others then null;
end $$;

-- Keep insert/update policies
-- For safety, ensure admin can update role via service_role (service bypasses RLS, so no need for admin select policy)
-- If we need admin to read all profiles via RLS (for admin panel), public true already covers it.
-- No need for extra admin select policy that causes recursion. Use security definer function if needed later.

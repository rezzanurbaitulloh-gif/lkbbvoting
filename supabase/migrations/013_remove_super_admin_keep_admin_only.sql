-- 013_remove_super_admin_keep_admin_only.sql
-- Hapus SUPER_ADMIN, hanya ADMIN (full akses) & USER

-- 1. Convert existing SUPER_ADMIN to ADMIN
update public.profiles set role='ADMIN' where role='SUPER_ADMIN';

-- 2. Update constraint to only USER, ADMIN
do $$
begin
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check check (role in ('USER','ADMIN'));
exception when others then null;
end $$;

-- 3. Update role_permissions: migrate SUPER_ADMIN perms to ADMIN if not exists, then delete SUPER_ADMIN rows
insert into public.role_permissions (role, permission_key, granted)
select 'ADMIN', permission_key, granted from public.role_permissions where role='SUPER_ADMIN'
on conflict (role, permission_key) do update set granted = excluded.granted;

delete from public.role_permissions where role='SUPER_ADMIN';

-- Also clean legacy EDITOR, PARTICIPANT if any
delete from public.role_permissions where role in ('EDITOR','PARTICIPANT','PUBLIC');

-- 4. Update is_cms_admin function to only ADMIN
create or replace function public.is_cms_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'ADMIN'
  );
$$;

-- 5. Update RLS policies that referenced SUPER_ADMIN
drop policy if exists "admin can read transactions" on public.transactions;
create policy "admin can read transactions" on public.transactions for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

drop policy if exists "admin can read supports" on public.supports;
create policy "admin can read supports" on public.supports for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

drop policy if exists "admin can read all profiles" on public.profiles;
create policy "admin can read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  or true
);

-- 6. Update FK already handled in 012, ensure sponsors etc still

-- 7. Ensure site_settings sponsors.enabled still exists (already)

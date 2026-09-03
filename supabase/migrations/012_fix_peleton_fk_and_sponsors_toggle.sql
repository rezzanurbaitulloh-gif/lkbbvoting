-- 012_fix_peleton_fk_and_sponsors_toggle.sql
-- Fix FK constraint untuk hapus peleton, hapus role EDITOR/PARTICIPANT constraint, sponsor toggle, hero settings, simplify roles

-- 1. Fix transactions_peleton_id_fkey to CASCADE (allow delete peleton even if ada transaksi)
-- Drop existing constraint and recreate with CASCADE
do $$
declare
  cons_name text;
begin
  select conname into cons_name from pg_constraint where conname='transactions_peleton_id_fkey' limit 1;
  if cons_name is not null then
    execute format('alter table public.transactions drop constraint %I', cons_name);
  end if;
  -- also check alternative name
  select conname into cons_name from pg_constraint where conname like '%transactions%peleton%fkey' limit 1;
  if cons_name is not null then
    execute format('alter table public.transactions drop constraint %I', cons_name);
  end if;
exception when others then null;
end $$;

-- Recreate with CASCADE (if peleton deleted, transactions deleted)
do $$
begin
  -- ensure peletons exists
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='transactions') then
    -- try to add constraint if not exists
    if not exists (select 1 from pg_constraint where conname='transactions_peleton_id_fkey') then
      alter table public.transactions add constraint transactions_peleton_id_fkey foreign key (peleton_id) references public.peletons(id) on delete cascade;
    end if;
  end if;
exception when others then null;
end $$;

-- Also ensure supports cascade (already cascade but ensure)
do $$
declare
  c text;
begin
  select conname into c from pg_constraint where conname='supports_peleton_id_fkey' limit 1;
  if c is not null then
    -- supports already cascade, keep
    null;
  end if;
exception when others then null;
end $$;

-- 2. Simplify profiles.role check to only USER, ADMIN, SUPER_ADMIN (hapus EDITOR/PARTICIPANT/PUBLIC)
do $$
begin
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check check (role in ('USER','ADMIN','SUPER_ADMIN'));
exception when others then null;
end $$;

-- 3. Update any existing EDITOR/PARTICIPANT to USER (or ADMIN if needed)
update public.profiles set role='USER' where role in ('EDITOR','PARTICIPANT','PUBLIC');

-- 4. Sponsor toggle & hero settings (site_settings)
insert into public.site_settings (key, value, category, description, is_public, is_system)
values
  ('sponsors.enabled', '"true"'::jsonb, 'general', 'Toggle tampil/sembunyi sponsor global', true, false),
  ('hero.background_image', '""'::jsonb, 'appearance', 'Background hero beranda', true, false),
  ('hero.overlay_opacity', '"0.32"'::jsonb, 'appearance', 'Overlay opacity hero 0-1', true, false),
  ('hero.logo_image', '"/assets/brand/lkbb-logo.jpg"'::jsonb, 'appearance', 'Logo watermark hero', true, false)
on conflict (key) do nothing;

-- 5. Ensure RLS for new keys is public (already is_public true)
-- 6. Update role_permissions to only have USER and SUPER_ADMIN/ADMIN (remove EDITOR/PARTICIPANT rows)
delete from public.role_permissions where role in ('EDITOR','PARTICIPANT','PUBLIC');
-- Ensure ADMIN has full perms (mirror SUPER_ADMIN)
insert into public.role_permissions (role, permission_key, granted)
select 'ADMIN', key, true from public.permissions
on conflict (role, permission_key) do update set granted = true;

-- 7. Update is_cms_admin function to only allow ADMIN/SUPER_ADMIN (hapus EDITOR)
create or replace function public.is_cms_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('ADMIN','SUPER_ADMIN')
  );
$$;

-- 8. Update admin read policies for transactions/supports to allow ADMIN too
drop policy if exists "admin can read transactions" on public.transactions;
create policy "admin can read transactions" on public.transactions for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

drop policy if exists "admin can read supports" on public.supports;
create policy "admin can read supports" on public.supports for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

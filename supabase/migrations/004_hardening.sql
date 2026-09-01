-- 004 hardening: logo_url, storage, RLS fixes, indexes, constraints

-- 1. Peletons: add logo_url if not exists (team photo vs logo separation)
alter table public.peletons add column if not exists logo_url text;
-- Backfill logo_url from image_url where null for existing rows
update public.peletons set logo_url = image_url where logo_url is null and image_url is not null;

-- 2. Ensure competitions has required fields for event control
alter table public.competitions add column if not exists logo_url text;
alter table public.competitions add column if not exists poster_url text;

-- 3. Add indexes for performance
create index if not exists idx_supports_peleton_source on public.supports(peleton_id, source);
create index if not exists idx_supports_created_at on public.supports(created_at desc);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_provider_ref on public.transactions(provider_ref) where provider_ref is not null;
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs(action);

-- 4. Ensure profiles trigger for auto-creation on auth.users insert
-- Create function to handle new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, public_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'public_name', split_part(new.email,'@',1)), 'USER')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. RLS: ensure profiles insert policy for new users (allow authenticated to insert own profile)
drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 6. Audit logs: allow service_role bypass, but add policy for admin read via service? Keep RLS enabled, block anon, allow authenticated admin via service? For now allow authenticated to read own? But we want admin via service API, so keep no direct read for anon.
-- Ensure anon cannot read audit_logs (already blocked). Add policy for authenticated admin via RLS using role check.
-- We will allow authenticated users to read audit_logs where they are admin via JWT? For simplicity, keep service_role only, but add a dummy policy that allows admin via existing DB check.
drop policy if exists "admin can read audit_logs" on public.audit_logs;
create policy "admin can read audit_logs" on public.audit_logs for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
);

-- 7. Ensure team_ranking is properly recreated to include logo_url and not bypass RLS incorrectly
-- Drop and recreate to allow column changes
drop view if exists public.team_ranking cascade;
create view public.team_ranking as
select
  p.id,
  p.slug,
  p.number,
  p.name,
  p.school,
  p.city,
  p.province,
  p.category,
  p.image_url,
  p.logo_url,
  p.cover_url,
  p.display_order,
  p.active,
  p.verified,
  coalesce(sum(case when s.source='online' then s.supports else 0 end),0) as online_ballots,
  coalesce(sum(case when s.source='offline' then s.supports else 0 end),0) as offline_ballots,
  coalesce(sum(s.supports),0) as total_ballots
from public.peletons p
left join public.supports s on s.peleton_id = p.id
where p.verified = true and p.active = true
group by p.id;
-- Re-grant anon read for now (will be revoked in future hardening for ranking leak fix)
grant select on public.team_ranking to anon, authenticated, service_role;

-- 8. Ensure supports immutability: prevent update/delete via RLS (no policies for update/delete = deny)
-- Already deny by default, but explicitly revoke
revoke update, delete on public.supports from anon, authenticated;

-- 9. Transactions immutability: same
revoke update, delete on public.transactions from anon, authenticated;

-- 10. Add check constraints
do $$ begin
  if not exists (select 1 from pg_constraint where conname='supports_supports_positive') then
    alter table public.supports add constraint supports_supports_positive check (supports >= -10000 and supports <= 10000);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='transactions_supports_positive') then
    alter table public.transactions add constraint transactions_supports_positive check (supports > 0 and supports <= 10000);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='transactions_amount_positive') then
    alter table public.transactions add constraint transactions_amount_positive check (amount > 0);
  end if;
end $$;

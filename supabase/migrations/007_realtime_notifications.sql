-- 007 realtime notifications — pop-up bersuara duar + TTS
-- Extend notifications for realtime use, add RLS, publication, indexes

-- 1. Extend notifications table for realtime support notifications
alter table public.notifications add column if not exists peleton_id uuid references public.peletons(id) on delete set null;
alter table public.notifications add column if not exists peleton_name text;
alter table public.notifications add column if not exists peleton_slug text;
alter table public.notifications add column if not exists supporter_name text;
alter table public.notifications add column if not exists data jsonb default '{}'::jsonb;
-- data will hold: { ballot_quantity, peleton_category, peleton_number, is_private }

-- 2. Index for polling / realtime
create index if not exists idx_notifications_user_id_created on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_peleton_id on public.notifications(peleton_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- 3. RLS: public can read public notifications (user_id is null), authenticated can read own
-- Enable RLS already enabled from 001, but ensure policies

-- Drop existing generic if needed and recreate more specific
drop policy if exists "public read notifications" on public.notifications;
drop policy if exists "users read own notifications" on public.notifications;
drop policy if exists "public can read public notifications" on public.notifications;
drop policy if exists "users can read own notifications" on public.notifications;

-- Public (anon + authenticated) can read public notifications where user_id is null
create policy "public can read public notifications" on public.notifications
  for select using (user_id is null);

-- Authenticated users can read their own private notifications
create policy "users can read own notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- Admin can read all (for dashboard)
drop policy if exists "admin can read notifications" on public.notifications;
create policy "admin can read notifications" on public.notifications
  for select using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('ADMIN','SUPER_ADMIN'))
  );

-- Service role bypass already, but ensure authenticated can insert via service only
-- No direct insert policy for anon/authenticated — only service_role inserts (webhook / status check)

-- 4. Enable realtime publication for notifications and supports
-- Supabase realtime uses publication supabase_realtime
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.supports;
alter publication supabase_realtime add table public.transactions;

-- Ensure REPLICA IDENTITY FULL for realtime payload completeness
alter table public.notifications replica identity full;
alter table public.supports replica identity full;
alter table public.transactions replica identity full;

-- 5. Grant select on notifications to anon/authenticated already via RLS, ensure table grant
grant select on public.notifications to anon, authenticated;
grant select on public.supports to anon, authenticated;
grant select on public.transactions to anon, authenticated;

-- 6. Comments
comment on column public.notifications.peleton_id is 'FK to peletons — which team was supported';
comment on column public.notifications.data is 'JSON: ballot_quantity for private, category, number etc';

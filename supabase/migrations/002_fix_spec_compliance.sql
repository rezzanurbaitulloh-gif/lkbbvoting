-- 002 — Fix spec compliance: team simplification, event state, ledger, ranking, RLS, indexes

-- 1. Teams: add display_order, active, ensure school/city remain but add constraints
alter table public.peletons add column if not exists display_order int not null default 0;
alter table public.peletons add column if not exists active boolean not null default true;
-- unique participant number (number+category)
do $$ begin
  if not exists (select 1 from pg_constraint where conname='peletons_number_category_unique') then
    alter table public.peletons add constraint peletons_number_category_unique unique (number, category);
  end if;
end $$;

create index if not exists idx_peletons_category_active_display on public.peletons(category, active, display_order);
create index if not exists idx_peletons_verified on public.peletons(verified) where verified = true;
create index if not exists idx_peletons_slug on public.peletons(slug);

-- 2. Supports: add source, note, admin_id, ensure idempotency via provider_ref on transactions
alter table public.supports add column if not exists source text not null default 'online' check (source in ('online','offline'));
alter table public.supports add column if not exists note text;
alter table public.supports add column if not exists admin_id uuid references public.profiles(id);

-- Transactions: add provider_ref unique for idempotency, add source
alter table public.transactions add column if not exists provider_ref text;
alter table public.transactions add column if not exists source text not null default 'online' check (source in ('online','offline'));
do $$ begin
  if not exists (select 1 from pg_indexes where indexname='uniq_transactions_provider_ref') then
    create unique index uniq_transactions_provider_ref on public.transactions(provider_ref) where provider_ref is not null;
  end if;
end $$;

-- 3. Profiles: name uniqueness at DB level (public_name)
do $$ begin
  if not exists (select 1 from pg_constraint where conname='profiles_public_name_unique') then
    alter table public.profiles add constraint profiles_public_name_unique unique (public_name);
  end if;
exception when duplicate_table then null;
end $$;
-- allow public_name to be not null later after seed, but keep nullable for now to avoid breaking existing

-- 4. Competitions: add missing fields for spec §31-36, §32, §21, §39-40
alter table public.competitions add column if not exists subtitle text;
alter table public.competitions add column if not exists event_date date;
alter table public.competitions add column if not exists event_time time;
alter table public.competitions add column if not exists countdown_title text;
alter table public.competitions add column if not exists show_provisional_result boolean not null default false;
alter table public.competitions add column if not exists show_final_result boolean not null default false;
alter table public.competitions add column if not exists published boolean not null default false;
-- settings jsonb will hold: online_price, offline_price, ballot_presets, whatsapp, sound, tts, social, etc.

-- 5. Sponsors: add active, display_order
alter table public.sponsors add column if not exists active boolean not null default true;
alter table public.sponsors add column if not exists display_order int not null default 0;
create index if not exists idx_sponsors_active_order on public.sponsors(active, display_order);

-- 6. Judges: ensure active
alter table public.judges add column if not exists active boolean not null default true;

-- 7. Timeline: ensure
alter table public.timeline_stages add column if not exists active boolean not null default true;

-- 8. Audit logs: ensure before/after
alter table public.audit_logs add column if not exists before_state jsonb;
alter table public.audit_logs add column if not exists after_state jsonb;
alter table public.audit_logs add column if not exists reason text;

-- 9. Create view for ranking: online+offline = total, category-specific
create or replace view public.team_ranking as
select
  p.id,
  p.slug,
  p.number,
  p.name,
  p.school,
  p.category,
  p.image_url,
  p.display_order,
  coalesce(sum(case when s.source='online' then s.supports else 0 end),0) as online_ballots,
  coalesce(sum(case when s.source='offline' then s.supports else 0 end),0) as offline_ballots,
  coalesce(sum(s.supports),0) as total_ballots
from public.peletons p
left join public.supports s on s.peleton_id = p.id
where p.verified = true and p.active = true
group by p.id;

-- 10. Enable RLS and policies (refined)
alter table public.profiles enable row level security;
alter table public.peletons enable row level security;
alter table public.supports enable row level security;
alter table public.transactions enable row level security;
alter table public.competitions enable row level security;
alter table public.sponsors enable row level security;
alter table public.judges enable row level security;
alter table public.news enable row level security;
alter table public.announcements enable row level security;
alter table public.faqs enable row level security;
alter table public.timeline_stages enable row level security;
alter table public.audit_logs enable row level security;

-- Public can read verified active peletons
drop policy if exists "public can read verified peletons" on public.peletons;
create policy "public can read verified peletons" on public.peletons for select using (verified = true and active = true);

-- Public can read active sponsors, judges, news published, etc.
drop policy if exists "public read sponsors" on public.sponsors;
create policy "public read sponsors" on public.sponsors for select using (active = true);

drop policy if exists "public read judges" on public.judges;
create policy "public read judges" on public.judges for select using (active = true);

drop policy if exists "public read news" on public.news;
create policy "public read news" on public.news for select using (published = true);

drop policy if exists "public read announcements" on public.announcements;
create policy "public read announcements" on public.announcements for select using (true);

drop policy if exists "public read faqs" on public.faqs;
create policy "public read faqs" on public.faqs for select using (true);

drop policy if exists "public read timeline" on public.timeline_stages;
create policy "public read timeline" on public.timeline_stages for select using (true);

drop policy if exists "public read competitions" on public.competitions;
create policy "public read competitions" on public.competitions for select using (true);

-- Supports: user can read own, public can read for ranking via view (but not raw totals during active event — this is enforced in API, not RLS)
drop policy if exists "users read own supports" on public.supports;
create policy "users read own supports" on public.supports for select using (auth.uid() = user_id);

-- Transactions: user can read own
drop policy if exists "users read own transactions" on public.transactions;
create policy "users read own transactions" on public.transactions for select using (auth.uid() = user_id);

-- Profiles: user can read own, public can read limited?
drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select using (true);

-- 11. Storage policies (for media bucket)
-- Note: storage.buckets already public, need to allow public read, authenticated upload
-- This is handled via storage.objects policies — create if not exists (requires storage extension)
-- We will create via SQL if storage schema exists
do $$ begin
  if exists (select 1 from information_schema.schemata where schema_name='storage') then
    -- allow public read
    if not exists (select 1 from pg_policies where policyname='public read media' and tablename='objects') then
      execute 'create policy "public read media" on storage.objects for select using (bucket_id in (''media'',''avatars''))';
    end if;
  end if;
exception when others then null;
end $$;

-- 12. Mark obsolete tables as deprecated but keep for history (do not drop)
comment on table public.peleton_members is 'OBSOLETE per spec §8 — kept for historical record, not used. Use peletons.image_url/logo only.';
comment on table public.peleton_gallery is 'OBSOLETE per spec §8 — kept for historical record, not used.';

-- 017 sync display_order to number (nomor urut = urutan tampil per kategori)
-- Spec: nomor urut peserta adalah urutan tampil, per kategori SMP/SMA terpisah.
-- Tidak ada kolom 'urutan tampil' terpisah di UI — display_order tetap ada di DB sebagai legacy
-- tapi selalu disync = numeric(number). Constraint unique(number, category) sudah ada via 002.

-- Sync existing data: display_order = number numeric (normalize "01" -> 1)
update public.peletons
set display_order = coalesce(nullif(regexp_replace(number, '^0+', ''), '')::int, 0)
where number is not null;

-- Ensure trigger to keep display_order synced on insert/update if not already via app
create or replace function public.sync_peleton_display_order() returns trigger as $$
begin
  -- number text like "03" -> 3
  NEW.display_order := coalesce(nullif(regexp_replace(coalesce(NEW.number,''), '^0+', ''), '')::int, 0);
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_peleton_display_order on public.peletons;
create trigger trg_sync_peleton_display_order
before insert or update of number on public.peletons
for each row execute function public.sync_peleton_display_order();

-- Refresh team_ranking view to ensure it exposes display_order synced (optional, recreate for clarity)
create or replace view public.team_ranking as
select
  p.id,
  p.slug,
  p.number,
  p.name,
  p.school,
  p.category,
  p.image_url,
  p.logo_url,
  p.display_order,
  coalesce(sum(case when s.source='online' then s.supports else 0 end),0) as online_ballots,
  coalesce(sum(case when s.source='offline' then s.supports else 0 end),0) as offline_ballots,
  coalesce(sum(s.supports),0) as total_ballots
from public.peletons p
left join public.supports s on s.peleton_id = p.id
where p.verified = true and p.active = true
group by p.id;

-- Index for nomor urut per kategori
create index if not exists idx_peletons_category_number on public.peletons(category, number);
create index if not exists idx_peletons_number_numeric on public.peletons((nullif(regexp_replace(number, '^0+', ''), '')::int));

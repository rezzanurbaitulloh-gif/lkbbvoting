-- 010_dynamic_cms.sql — Dynamic Admin Dashboard / CMS Architecture
-- Fitur: 1) Dynamic Content Management  2) CRUD & Media Manager  3) Settings & Access Control
-- Struktur: cms_pages -> cms_sections -> (settings/content JSONB) + site_settings + media_library + RBAC enhancement

-- ============================================================
-- 1. CMS PAGES — definisi halaman yang bisa di-CMS-kan
-- ============================================================
create table if not exists public.cms_pages (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null, -- e.g. 'home', 'tentang', 'kompetisi', 'peraturan', 'kontak'
  title text not null,       -- label admin, e.g. 'Beranda'
  description text,
  is_system boolean not null default false, -- system pages (home, tim) tidak boleh hapus slug-nya
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  seo_image text,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_cms_pages_slug on public.cms_pages(slug);
create index if not exists idx_cms_pages_published on public.cms_pages(is_published);

-- ============================================================
-- 2. CMS SECTIONS — blok penyusun halaman (hero, banner, list, dll)
--    Orderable, visibility toggle, settings+content fleksibel via JSONB
-- ============================================================
create table if not exists public.cms_sections (
  id uuid primary key default uuid_generate_v4(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  key text not null, -- unique per page, e.g. 'hero', 'hero_countdown', 'featured_smp', 'stats', 'sponsors'
  title text not null, -- label admin, e.g. 'Hero Utama'
  type text not null check (type in ('hero','banner','text_block','rich_text','image','gallery','video','stats','list','grid','timeline','faq','sponsors','cta','countdown','podium','featured','custom')),
  is_visible boolean not null default true,
  sort_order int not null default 0,
  -- settings: layout / style config (columns, background, variant, etc.) — tidak mengubah konten
  settings jsonb not null default '{}'::jsonb,
  -- content: data dinamis yang di-edit admin (heading, subheading, body, images[], buttons[], items[])
  content jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(page_id, key)
);
create index if not exists idx_cms_sections_page_sort on public.cms_sections(page_id, sort_order);
create index if not exists idx_cms_sections_type on public.cms_sections(type);
create index if not exists idx_cms_sections_visible on public.cms_sections(is_visible);

-- ============================================================
-- 3. SITE SETTINGS — key-value global (general, branding, contact, sosmed, appearance)
--    Menggantikan kompetisi.settings yang tersebar — menjadi single source of truth untuk "Pengaturan Umum"
-- ============================================================
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null, -- e.g. 'site.name', 'site.tagline', 'branding.logo', 'contact.whatsapp', 'social.instagram', 'appearance.primary_color'
  value jsonb not null default '""'::jsonb, -- string / number / object fleksibel: {"value":"LKBB JAVASOMA"} atau "https://..."
  category text not null default 'general' check (category in ('general','branding','contact','social','appearance','seo','event','integration','advanced')),
  description text,
  is_public boolean not null default true, -- apakah boleh di-expose ke public API / frontend tanpa auth
  is_system boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_site_settings_category on public.site_settings(category);
create index if not exists idx_site_settings_public on public.site_settings(is_public);

-- ============================================================
-- 4. MEDIA LIBRARY — sentral upload / ganti / hapus aset (gambar, banner, logo)
-- ============================================================
create table if not exists public.media_library (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,      -- stored name di bucket, e.g. '173...xyz.jpg'
  original_name text not null,  -- nama asli upload
  url text not null,            -- public URL
  storage_path text not null,   -- path di bucket 'media', e.g. 'cms/hero-123.jpg'
  mime_type text not null default 'image/jpeg',
  size int not null default 0,  -- bytes
  width int,
  height int,
  alt_text text,
  caption text,
  folder text not null default 'general' check (folder in ('general','hero','banner','peleton','sponsors','juri','poster','branding','gallery','other')),
  tags text[] default '{}',
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists idx_media_folder on public.media_library(folder);
create index if not exists idx_media_created on public.media_library(created_at desc);
create index if not exists idx_media_tags on public.media_library using gin(tags);

-- ============================================================
-- 5. RBAC ENHANCEMENT — granular permissions
--    profiles.role tetap: USER | ADMIN | SUPER_ADMIN (+ EDITOR opsional)
--    Tabel permissions + role_permissions untuk kontrol halus
-- ============================================================
-- Extend profiles.role check to include EDITOR (content editor tanpa akses user/settings sensitif)
do $$ begin
  -- drop old check, recreate with EDITOR
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check check (role in ('USER','PARTICIPANT','ADMIN','SUPER_ADMIN','EDITOR'));
exception when others then null;
end $$;

create table if not exists public.permissions (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null, -- e.g. 'cms.pages.read', 'cms.sections.write', 'media.delete', 'settings.write', 'users.manage'
  name text not null,
  description text,
  category text not null default 'cms' check (category in ('cms','media','settings','users','peletons','transactions','system')),
  created_at timestamptz default now()
);

create table if not exists public.role_permissions (
  role text not null, -- matches profiles.role
  permission_key text not null references public.permissions(key) on delete cascade,
  granted boolean not null default true,
  primary key (role, permission_key)
);

-- User-level override (opsional, untuk kasus khusus)
create table if not exists public.user_permissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  granted boolean not null default true,
  created_at timestamptz default now(),
  unique(user_id, permission_key)
);

-- ============================================================
-- 6. CMS REVISIONS — audit trail perubahan konten (optional, lightweight)
-- ============================================================
create table if not exists public.cms_revisions (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null check (entity_type in ('page','section','setting','media')),
  entity_id uuid not null,
  action text not null check (action in ('create','update','delete','reorder','publish','unpublish')),
  before jsonb,
  after jsonb,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists idx_cms_revisions_entity on public.cms_revisions(entity_type, entity_id);
create index if not exists idx_cms_revisions_created on public.cms_revisions(created_at desc);

-- ============================================================
-- 7. ENABLE RLS + POLICIES
-- ============================================================
alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_library enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_permissions enable row level security;
alter table public.cms_revisions enable row level security;

-- Public: boleh baca halaman & section yang published/visible saja — via API service_role, tapi tetap kasih policy read untuk anon
drop policy if exists "public read published pages" on public.cms_pages;
create policy "public read published pages" on public.cms_pages for select using (is_published = true);

drop policy if exists "public read visible sections" on public.cms_sections;
create policy "public read visible sections" on public.cms_sections for select using (is_visible = true);

drop policy if exists "public read public settings" on public.site_settings;
create policy "public read public settings" on public.site_settings for select using (is_public = true);

drop policy if exists "public read media" on public.media_library;
create policy "public read media" on public.media_library for select using (true);

drop policy if exists "public read permissions" on public.permissions;
create policy "public read permissions" on public.permissions for select using (true);

-- Admin: full access via helper function is_admin()
create or replace function public.is_cms_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('ADMIN','SUPER_ADMIN','EDITOR')
  );
$$;

drop policy if exists "admin all pages" on public.cms_pages;
create policy "admin all pages" on public.cms_pages for all using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "admin all sections" on public.cms_sections;
create policy "admin all sections" on public.cms_sections for all using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "admin all settings" on public.site_settings;
create policy "admin all settings" on public.site_settings for all using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "admin all media" on public.media_library;
create policy "admin all media" on public.media_library for all using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "admin read role_perms" on public.role_permissions;
create policy "admin read role_perms" on public.role_permissions for select using (public.is_cms_admin());
drop policy if exists "super_admin manage role_perms" on public.role_permissions;
create policy "super_admin manage role_perms" on public.role_permissions for all using (
  exists (select 1 from public.profiles where id=auth.uid() and role='SUPER_ADMIN')
) with check (
  exists (select 1 from public.profiles where id=auth.uid() and role='SUPER_ADMIN')
);

drop policy if exists "admin read user_perms" on public.user_permissions;
create policy "admin read user_perms" on public.user_permissions for select using (public.is_cms_admin());
drop policy if exists "super_admin manage user_perms" on public.user_permissions;
create policy "super_admin manage user_perms" on public.user_permissions for all using (
  exists (select 1 from public.profiles where id=auth.uid() and role='SUPER_ADMIN')
) with check (
  exists (select 1 from public.profiles where id=auth.uid() and role='SUPER_ADMIN')
);

drop policy if exists "admin read revisions" on public.cms_revisions;
create policy "admin read revisions" on public.cms_revisions for select using (public.is_cms_admin());
drop policy if exists "admin insert revisions" on public.cms_revisions;
create policy "admin insert revisions" on public.cms_revisions for insert with check (public.is_cms_admin());

-- ============================================================
-- 8. TRIGGERS — updated_at otomatis
-- ============================================================
create or replace function public.handle_cms_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cms_pages_updated on public.cms_pages;
create trigger trg_cms_pages_updated before update on public.cms_pages for each row execute function public.handle_cms_updated_at();
drop trigger if exists trg_cms_sections_updated on public.cms_sections;
create trigger trg_cms_sections_updated before update on public.cms_sections for each row execute function public.handle_cms_updated_at();
drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings for each row execute function public.handle_cms_updated_at();

-- ============================================================
-- 9. SEED — default pages
-- ============================================================
insert into public.cms_pages (slug, title, description, is_system, is_published, seo_title, seo_description, sort_order)
values
  ('home','Beranda','Halaman utama LKBB Javasoma — hero, countdown, peserta unggulan', true, true, 'LKBB Javasoma The Impression — Peleton Terfavorit','Dukung peleton terbaik pilihanmu di LKBB Javasoma 2026', 1),
  ('tim','Tim Peserta','Daftar semua peleton SMP & SMA', true, true, 'Tim Peserta — LKBB Javasoma','Daftar lengkap peleton SMP & SMA terverifikasi', 2),
  ('kompetisi','Kompetisi','Info kompetisi, peraturan, timeline, juri, sponsor', true, true, 'Kompetisi — LKBB Javasoma','Informasi lengkap LKBB Javasoma The Impression 2026', 3),
  ('peraturan','Peraturan','Peraturan lomba', false, true, 'Peraturan — LKBB Javasoma', null, 4),
  ('timeline','Timeline','Jadwal acara', false, true, 'Timeline — LKBB Javasoma', null, 5),
  ('juri','Dewan Juri','Profil juri', false, true, null, null, 6),
  ('pengumuman','Pengumuman','Pengumuman resmi', false, true, null, null, 7),
  ('kontak','Kontak','Hubungi panitia', false, true, null, null, 8)
on conflict (slug) do nothing;

-- seed sections for home
do $$
declare
  home_id uuid;
begin
  select id into home_id from public.cms_pages where slug='home' limit 1;
  if home_id is not null then
    insert into public.cms_sections (page_id, key, title, type, is_visible, sort_order, settings, content)
    values
      (home_id, 'hero', 'Hero Utama', 'hero', true, 1,
        '{"variant":"dark","showLogo":true,"overlayOpacity":0.32}'::jsonb,
        '{"eyebrow":"LKBB • JAVASOMA THE IMPRESSION","headingLine1":"PELETON","headingLine2":"TERFAVORIT","subtitle":"LKBB","subtitle2":"JAVASOMA THE IMPRESSION","tagline":"ASTRA DHARMA HAYUNING BUDAYA","description":"Dukung peleton terbaik pilihanmu dan jadilah bagian dari kemeriahan LKBB tahun ini.","ctaPrimaryLabel":"LIHAT PESERTA","ctaPrimaryLink":"/tim","ctaSecondaryLabel":"CARA DUKUNG","backgroundImage":"https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=1600&auto=format&fit=crop&q=70","logoImage":"/assets/brand/lkbb-logo.jpg"}'::jsonb
      ),
      (home_id, 'countdown', 'Countdown Event', 'countdown', true, 2,
        '{"variant":"bar"}'::jsonb,
        '{"title":"EVENT DIMULAI DALAM","targetDateSource":"competition.voting_end","fallbackDate":"2026-10-24T23:59:59+07:00"}'::jsonb
      ),
      (home_id, 'featured', 'Peleton Unggulan', 'featured', true, 3,
        '{"columns":3}'::jsonb,
        '{"title":"DUKUNG PELETON FAVORITMU!","subtitle":"PESERTA","description":"Beranda selalu urut nomor peserta (01, 02, 03...) — peringkat disembunyikan saat voting aktif","showBadge":true}'::jsonb
      ),
      (home_id, 'podium', 'Podium Juara', 'podium', true, 4,
        '{}'::jsonb,
        '{"title":"PODIUM JUARA","showOnlyWhen":"RESULT_PUBLISHED"}'::jsonb
      ),
      (home_id, 'sponsors', 'Sponsor', 'sponsors', true, 5,
        '{"variant":"grid"}'::jsonb,
        '{"title":"DIDUKUNG OLEH","subtitle":"SPONSOR & MITRA"}'::jsonb
      ),
      (home_id, 'cta', 'CTA Penutup', 'cta', true, 6,
        '{"variant":"dark"}'::jsonb,
        '{"heading":"SIAP DUKUNG JAGOANMU?","description":"Pilih peleton favoritmu dan berikan dukungan terbaik.","buttonLabel":"LIHAT DAFTAR TIM","buttonLink":"/tim"}'::jsonb
      )
    on conflict (page_id, key) do nothing;
  end if;
end $$;

-- seed site_settings defaults (migrated from competitionConfig fallback)
insert into public.site_settings (key, value, category, description, is_public, is_system)
values
  ('site.name', '"LKBB JAVASOMA"'::jsonb, 'general', 'Nama kompetisi', true, true),
  ('site.subtitle', '"The Impression"'::jsonb, 'general', 'Sub judul', true, false),
  ('site.tagline', '"ASTRA DHARMA HAYUNING BUDAYA"'::jsonb, 'general', 'Tagline', true, false),
  ('site.organizer', '"PASKIBRA SMKN 1 KERTOSONO"'::jsonb, 'general', 'Penyelenggara', true, false),
  ('site.description', '"Platform digital resmi PELETON TERFAVORIT — ASTRA DHARMA HAYUNING BUDAYA. Kompetisi baris-berbaris paling prestisius se-Jawa Timur."'::jsonb, 'general', 'Deskripsi footer', true, false),
  ('branding.logo', '"/assets/brand/lkbb-logo.jpg"'::jsonb, 'branding', 'Logo utama', true, false),
  ('branding.logo_paskibra', '"/assets/brand/paskibra-logo.jpg"'::jsonb, 'branding', 'Logo Paskibra', true, false),
  ('branding.logo_school', '"/assets/brand/school-logo.jpg"'::jsonb, 'branding', 'Logo sekolah', true, false),
  ('branding.poster', '"/assets/poster/lkbb-poster.jpg"'::jsonb, 'branding', 'Poster resmi', true, false),
  ('contact.email', '"info@lkbb-event.id"'::jsonb, 'contact', 'Email resmi', true, false),
  ('contact.whatsapp', '"0812-3456-7890"'::jsonb, 'contact', 'WhatsApp umum', true, false),
  ('contact.whatsapp_smp', '"081578202646"'::jsonb, 'contact', 'WA SMP', true, false),
  ('contact.whatsapp_sma', '"087866882594"'::jsonb, 'contact', 'WA SMA', true, false),
  ('contact.address', '"SMK Negeri 1 Kertosono, Nganjuk, Jawa Timur"'::jsonb, 'contact', 'Alamat', true, false),
  ('social.instagram', '"https://instagram.com/lkbb_event"'::jsonb, 'social', 'Instagram', true, false),
  ('social.youtube', '"https://youtube.com/@lkbb"'::jsonb, 'social', 'YouTube', true, false),
  ('social.tiktok', '"https://tiktok.com/@lkbb_event"'::jsonb, 'social', 'TikTok', true, false),
  ('appearance.primary_color', '"#C9A86A"'::jsonb, 'appearance', 'Warna primer', true, false),
  ('appearance.theme', '"dark"'::jsonb, 'appearance', 'Tema default', true, false),
  ('seo.title', '"LKBB Javasoma The Impression 2026"'::jsonb, 'seo', 'SEO title default', true, false),
  ('seo.description', '"Dukung peleton terbaik pilihanmu di LKBB Javasoma The Impression 2026 — ASTRA DHARMA HAYUNING BUDAYA."'::jsonb, 'seo', 'SEO description default', true, false),
  ('event.dates', '{"pendaftaran":"Agustus s.d. Kuota terpenuhi","technicalMeeting":"3 Oktober 2026","pelaksanaan":"24 Oktober 2026","votingStart":"2026-09-15T00:00:00+07:00","votingEnd":"2026-10-24T23:59:59+07:00"}'::jsonb, 'event', 'Tanggal penting', true, false),
  ('event.state', '"VOTING_OPEN"'::jsonb, 'event', 'State kompetisi', true, false)
on conflict (key) do nothing;

-- seed permissions
insert into public.permissions (key, name, description, category) values
  ('cms.pages.read','Lihat Halaman CMS','Melihat daftar halaman & pratinjau','cms'),
  ('cms.pages.write','Kelola Halaman CMS','Tambah / ubah / hapus halaman','cms'),
  ('cms.sections.read','Lihat Section','Melihat section & konten','cms'),
  ('cms.sections.write','Kelola Section','Tambah / ubah / hapus / atur urutan section','cms'),
  ('cms.sections.publish','Publish Section','Mengubah visibilitas section','cms'),
  ('media.read','Lihat Media','Melihat library media','media'),
  ('media.upload','Upload Media','Upload & ganti media','media'),
  ('media.delete','Hapus Media','Hapus media','media'),
  ('settings.read','Lihat Pengaturan','Melihat pengaturan umum','settings'),
  ('settings.write','Kelola Pengaturan','Mengubah pengaturan umum & branding','settings'),
  ('users.read','Lihat Pengguna','Melihat daftar pengguna','users'),
  ('users.manage','Kelola Pengguna','Mengubah peran & hak akses','users'),
  ('users.permissions','Kelola Hak Akses','Mengatur permission granular','users'),
  ('peletons.read','Lihat Peleton','Melihat data peleton','peletons'),
  ('peletons.write','Kelola Peleton','CRUD peleton','peletons'),
  ('transactions.read','Lihat Transaksi','Melihat transaksi','transactions'),
  ('transactions.manage','Kelola Transaksi','Verifikasi / kelola transaksi','transactions'),
  ('system.audit','Lihat Audit Log','Melihat riwayat aktivitas','system'),
  ('system.admin','Akses Admin Penuh','Bypass semua cek','system')
on conflict (key) do nothing;

-- seed role_permissions
insert into public.role_permissions (role, permission_key, granted) values
  -- SUPER_ADMIN: all
  ('SUPER_ADMIN','cms.pages.read',true),('SUPER_ADMIN','cms.pages.write',true),('SUPER_ADMIN','cms.sections.read',true),('SUPER_ADMIN','cms.sections.write',true),('SUPER_ADMIN','cms.sections.publish',true),
  ('SUPER_ADMIN','media.read',true),('SUPER_ADMIN','media.upload',true),('SUPER_ADMIN','media.delete',true),
  ('SUPER_ADMIN','settings.read',true),('SUPER_ADMIN','settings.write',true),
  ('SUPER_ADMIN','users.read',true),('SUPER_ADMIN','users.manage',true),('SUPER_ADMIN','users.permissions',true),
  ('SUPER_ADMIN','peletons.read',true),('SUPER_ADMIN','peletons.write',true),
  ('SUPER_ADMIN','transactions.read',true),('SUPER_ADMIN','transactions.manage',true),
  ('SUPER_ADMIN','system.audit',true),('SUPER_ADMIN','system.admin',true),
  -- ADMIN: all except users.permissions & system.admin
  ('ADMIN','cms.pages.read',true),('ADMIN','cms.pages.write',true),('ADMIN','cms.sections.read',true),('ADMIN','cms.sections.write',true),('ADMIN','cms.sections.publish',true),
  ('ADMIN','media.read',true),('ADMIN','media.upload',true),('ADMIN','media.delete',true),
  ('ADMIN','settings.read',true),('ADMIN','settings.write',true),
  ('ADMIN','users.read',true),('ADMIN','users.manage',true),
  ('ADMIN','peletons.read',true),('ADMIN','peletons.write',true),
  ('ADMIN','transactions.read',true),('ADMIN','transactions.manage',true),
  ('ADMIN','system.audit',true),
  -- EDITOR: hanya CMS + media + peleton (tidak boleh kelola users / settings sensitif)
  ('EDITOR','cms.pages.read',true),('EDITOR','cms.pages.write',true),('EDITOR','cms.sections.read',true),('EDITOR','cms.sections.write',true),('EDITOR','cms.sections.publish',true),
  ('EDITOR','media.read',true),('EDITOR','media.upload',true),('EDITOR','media.delete',false),
  ('EDITOR','settings.read',true),
  ('EDITOR','peletons.read',true),('EDITOR','peletons.write',true),
  ('EDITOR','transactions.read',true),
  -- USER/PARTICIPANT: no admin perms (implicit deny)
  ('USER','cms.pages.read',false)
on conflict (role, permission_key) do nothing;

-- grant usage
grant select on public.cms_pages, public.cms_sections, public.site_settings, public.media_library, public.permissions, public.role_permissions, public.user_permissions, public.cms_revisions to anon, authenticated, service_role;
grant all on public.cms_pages, public.cms_sections, public.site_settings, public.media_library, public.cms_revisions to service_role;

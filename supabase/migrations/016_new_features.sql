-- 016_new_features — support all requested admin fixes: tim bg, sound, social list, avatar notification, logo handling
-- Tim background shares hero background but CRUD separately via site_settings tim.background_image
-- Sound settings, footer social list extensible, notifications avatar, etc.

-- 1. Notifications: add supporter_avatar column (plus ensure data column holds it)
alter table public.notifications add column if not exists supporter_avatar text;
alter table public.notifications add column if not exists supporter_name text; -- already exists via 007 but ensure
create index if not exists idx_notifications_supporter_avatar on public.notifications(supporter_avatar);

-- 2. Profiles avatar_url already exists per 001, ensure it is nullable and index
alter table public.profiles add column if not exists avatar_url text;

-- 3. Site settings: ensure new keys exist with defaults
insert into public.site_settings (key, value, category, description, is_public, is_system) values
  ('tim.background_image', '""'::jsonb, 'appearance', 'Background header halaman Tim — fallback ke hero.background_image jika kosong', true, false),
  ('tim.overlay_opacity', '"0.20"'::jsonb, 'appearance', 'Overlay opacity halaman Tim', true, false),
  ('sound.enabled', '"true"'::jsonb, 'general', 'Global toggle sound notifikasi', true, false),
  ('sound.volume', '"0.85"'::jsonb, 'general', 'Volume ledakan 0-1', true, false),
  ('sound.explosion_url', '"/sounds/duar.mp3"'::jsonb, 'general', 'URL audio ledakan', true, false),
  ('sound.tts_mode', '"random"'::jsonb, 'general', 'Mode TTS random/male/female', true, false),
  ('social.list', '"[]"'::jsonb, 'social', 'List sosial extensible JSON array platform/url/visible', true, false),
  ('social.facebook', '"https://facebook.com/lkbb_event"'::jsonb, 'social', 'Facebook fallback', true, false),
  ('social.twitter', '"https://x.com/lkbb_event"'::jsonb, 'social', 'X fallback', true, false),
  ('social.linkedin', '"https://linkedin.com/company/lkbb"'::jsonb, 'social', 'LinkedIn fallback', true, false),
  ('social.whatsapp', '"https://wa.me/6281234567890"'::jsonb, 'social', 'WhatsApp fallback', true, false),
  ('social.telegram', '"https://t.me/lkbb_event"'::jsonb, 'social', 'Telegram fallback', true, false)
on conflict (key) do nothing;

-- Ensure hero keys already exist (from 010) but guarantee
insert into public.site_settings (key, value, category, description, is_public, is_system) values
  ('hero.background_image', '""'::jsonb, 'appearance', 'Background hero beranda', true, false),
  ('hero.overlay_opacity', '"0.32"'::jsonb, 'appearance', 'Overlay hero', true, false)
on conflict (key) do nothing;

-- Seed social.list from existing social keys if empty (run once)
do $$
declare
  list_json jsonb;
  ig text; yt text; tt text; fb text; tw text; li text; wa text; tg text;
begin
  select value #>> '{}' into ig from public.site_settings where key='social.instagram';
  select value #>> '{}' into yt from public.site_settings where key='social.youtube';
  select value #>> '{}' into tt from public.site_settings where key='social.tiktok';
  -- check if social.list is empty array string
  select value into list_json from public.site_settings where key='social.list';
  if list_json is null or list_json::text in ('"[]"', '[]', '""', '""[]""') then
    -- build default array
    list_json := jsonb_build_array(
      jsonb_build_object('id','ig1','platform','instagram','url', coalesce(ig,'https://instagram.com/lkbb_event'), 'visible', true),
      jsonb_build_object('id','yt1','platform','youtube','url', coalesce(yt,'https://youtube.com/@lkbb'), 'visible', true),
      jsonb_build_object('id','tt1','platform','tiktok','url', coalesce(tt,'https://tiktok.com/@lkbb_event'), 'visible', true)
    );
    update public.site_settings set value = to_jsonb(list_json::text) where key='social.list';
    -- Actually store as JSON string via jsonb: we want value to be json string of array, but site_settings value is jsonb so array directly
    update public.site_settings set value = list_json where key='social.list';
  end if;
end $$;

-- 4. Enable realtime for profiles avatar updates? Not needed but ensure peletons logo_url exists
alter table public.peletons add column if not exists logo_url text;

-- 5. Storage buckets ensure public
update storage.buckets set public = true where id in ('media','avatars');
-- Ensure avatars bucket exists
insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do nothing;

-- 6. RLS for notifications already done, but ensure new column selectable
grant select on public.notifications to anon, authenticated, service_role;
grant select on public.profiles to anon, authenticated, service_role;

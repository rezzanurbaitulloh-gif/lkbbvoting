-- 003 — Seed realistic data for LKBB JAVASOMA THE IMPRESSION

-- Event
insert into public.competitions (id, name, subtitle, tagline, event_date, event_time, voting_start, voting_end, state, show_provisional_result, show_final_result, published, settings)
values (
  '00000000-0000-0000-0000-000000000001',
  'PELETON TERFAVORIT',
  'JAVASOMA THE IMPRESSION',
  'ASTRA DHARMA HAYUNING BUDAYA',
  '2026-10-24',
  '08:00',
  '2026-09-01 00:00:00+07',
  '2026-10-24 23:59:59+07',
  'VOTING_OPEN',
  false,
  false,
  false,
  '{
    "online_price": 3000,
    "offline_price": 5000,
    "ballot_presets": [10,50,100,300],
    "whatsapp": {"number": "6281234567890", "message": "Halo panitia LKBB, saya butuh bantuan", "enabled": true},
    "sound": {"enabled": true, "background": true, "notification": true, "tts": false},
    "countdown_title": "MENUJU HARI H",
    "social": {"instagram": "https://instagram.com/lkbb_event", "youtube": "https://youtube.com/@lkbb", "tiktok": "https://tiktok.com/@lkbb_event"},
    "contact": {"email": "info@lkbb-event.id", "address": "SMK Negeri 1 Kertosono, Nganjuk, Jawa Timur"}
  }'::jsonb
) on conflict (id) do update set
  name=excluded.name, subtitle=excluded.subtitle, tagline=excluded.tagline, event_date=excluded.event_date, settings=excluded.settings;

-- Teams: 12 peletons, simplified to 7 fields + display_order
-- Use storage URLs for now (will be replaced with real uploads via admin)
insert into public.peletons (id, slug, number, name, school, city, province, category, description, image_url, display_order, active, verified, status, support_count) values
('00000000-0000-0000-0000-000000000011', 'smkn-1-kertosono', '01', 'SMKN 1 KERTOSONO', 'SMK Negeri 1 Kertosono', 'Kertosono', 'Jawa Timur', 'SMA', 'Peleton disiplin tinggi, kekompakan solid, semangat juang luar biasa.', 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&auto=format&fit=crop&q=60', 1, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000012', 'smpn-1-nganjuk', '02', 'SMPN 1 NGANJUK', 'SMP Negeri 1 Nganjuk', 'Nganjuk', 'Jawa Timur', 'SMP', 'Kekuatan muda presisi memukau, variasi formasi kreatif.', 'https://images.unsplash.com/photo-1576669801838-1b1c52121d7a?w=800&auto=format&fit=crop&q=60', 2, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000013', 'sman-1-nganjuk', '03', 'SMAN 1 NGANJUK', 'SMA Negeri 1 Nganjuk', 'Nganjuk', 'Jawa Timur', 'SMA', 'Peleton senior pengalaman nasional, kedisiplinan tinggi.', 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800&auto=format&fit=crop&q=60', 3, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000014', 'smkn-2-nganjuk', '04', 'SMKN 2 NGANJUK', 'SMK Negeri 2 Nganjuk', 'Nganjuk', 'Jawa Timur', 'SMA', 'Presisi dipadu kreativitas formasi modern.', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc32d?w=800&auto=format&fit=crop&q=60', 4, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000015', 'smkn-1-nganjuk', '05', 'SMKN 1 NGANJUK', 'SMK Negeri 1 Nganjuk', 'Nganjuk', 'Jawa Timur', 'SMA', 'Teknik dan kekompakan teruji berbagai kejuaraan.', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&auto=format&fit=crop&q=60', 5, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000016', 'sman-1-kertosono', '06', 'SMAN 1 KERTOSONO', 'SMA Negeri 1 Kertosono', 'Kertosono', 'Jawa Timur', 'SMA', 'Kebanggaan Kertosono tradisi juara kuat.', 'https://images.unsplash.com/photo-1602632704322-5c8b0d28b6de?w=800&auto=format&fit=crop&q=60', 6, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000017', 'smpn-2-nganjuk', '07', 'SMPN 2 NGANJUK', 'SMP Negeri 2 Nganjuk', 'Nganjuk', 'Jawa Timur', 'SMP', 'Generasi penerus semangat membara.', 'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=800&auto=format&fit=crop&q=60', 7, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000018', 'mtsn-2-nganjuk', '08', 'MTsN 2 NGANJUK', 'MTs Negeri 2 Nganjuk', 'Nganjuk', 'Jawa Timur', 'SMP', 'Kedisiplinan dengan kekompakan spiritual.', 'https://images.unsplash.com/photo-1521999697949-8f47d8544533?w=800&auto=format&fit=crop&q=60', 8, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000019', 'smpn-1-kertosono', '09', 'SMPN 1 KERTOSONO', 'SMP Negeri 1 Kertosono', 'Kertosono', 'Jawa Timur', 'SMP', 'Muda berbakat latihan intensif.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=60', 9, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000020', 'sman-2-nganjuk', '10', 'SMAN 2 NGANJUK', 'SMA Negeri 2 Nganjuk', 'Nganjuk', 'Jawa Timur', 'SMA', 'Kombinasi ketegasan dan kreativitas.', 'https://images.unsplash.com/photo-15116327648-9bca21baa4d4?w=800&auto=format&fit=crop&q=60', 10, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000021', 'smkn-1-bagor', '11', 'SMKN 1 BAGOR', 'SMK Negeri 1 Bagor', 'Bagor', 'Jawa Timur', 'SMA', 'Semangat yel-yel menggema.', 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&auto=format&fit=crop&q=60', 11, true, true, 'Verified', 0),
('00000000-0000-0000-0000-000000000022', 'mtsn-1-nganjuk', '12', 'MTsN 1 NGANJUK', 'MTs Negeri 1 Nganjuk', 'Nganjuk', 'Jawa Timur', 'SMP', 'Keanggunan presisi nilai religius.', 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800&auto=format&fit=crop&q=60', 12, true, true, 'Verified', 0)
on conflict (id) do update set slug=excluded.slug, number=excluded.number, name=excluded.name, display_order=excluded.display_order;

-- Sponsors
insert into public.sponsors (id, name, tier, logo_url, display_order, active) values
('00000000-0000-0000-0000-000000000031', 'ASTRA', 'Main Sponsor', 'ASTRA', 1, true),
('00000000-0000-0000-0000-000000000032', 'BRI', 'Official Partner', 'BRI', 2, true),
('00000000-0000-0000-0000-000000000033', 'Telkomsel', 'Official Partner', 'Telkomsel', 3, true),
('00000000-0000-0000-0000-000000000034', 'Indosat', 'Official Partner', 'Indosat Ooredoo', 4, true),
('00000000-0000-0000-0000-000000000035', 'Wardah', 'Supporting Partner', 'Wardah', 5, true),
('00000000-0000-0000-0000-000000000036', 'Hydro Coco', 'Supporting Partner', 'Hydro Coco', 6, true),
('00000000-0000-0000-0000-000000000037', 'Le Minerale', 'Supporting Partner', 'Le Minerale', 7, true),
('00000000-0000-0000-0000-000000000038', 'Kahf', 'Media Partner', 'Kahf', 8, true)
on conflict (id) do nothing;

-- Judges
insert into public.judges (id, name, role, bio, photo_url, sort_order, active) values
('00000000-0000-0000-0000-000000000041', 'Serka Aditya Gemy C.YK', 'JURI PBB', 'Berpengalaman juri PBB regional dan nasional.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60', 1, true),
('00000000-0000-0000-0000-000000000042', 'Aditya Rendy', 'JURI PBB VARIASI & FORMASI', 'Spesialis variasi dan formasi.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60', 2, true),
('00000000-0000-0000-0000-000000000043', 'Andre Billy', 'JURI PBB VARIASI DAN FORMASI', 'Praktisi baris-berbaris jam terbang tinggi.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60', 3, true)
on conflict (id) do nothing;

-- Timeline
insert into public.timeline_stages (id, title, date, description, status, sort_order, active) values
('00000000-0000-0000-0000-000000000051', 'Pendaftaran', 'Agustus 2026', 'Pendaftaran dibuka hingga kuota terpenuhi', 'completed', 1, true),
('00000000-0000-0000-0000-000000000052', 'Verifikasi', 'September 2026', 'Verifikasi berkas dan kelayakan peleton', 'completed', 2, true),
('00000000-0000-0000-0000-000000000053', 'Publikasi Peleton', '1 September 2026', 'Peleton terverifikasi dipublikasikan', 'current', 3, true),
('00000000-0000-0000-0000-000000000054', 'Voting Dibuka', '1 September 2026', 'Dukungan peleton terfavorit dibuka', 'current', 4, true),
('00000000-0000-0000-0000-000000000055', 'Technical Meeting', '3 Oktober 2026', 'Briefing teknis seluruh peserta', 'upcoming', 5, true),
('00000000-0000-0000-0000-000000000056', 'Pelaksanaan Lomba', '24 Oktober 2026', 'Hari pelaksanaan LKBB Javasoma', 'upcoming', 6, true),
('00000000-0000-0000-0000-000000000057', 'Verifikasi Hasil', '24-25 Oktober 2026', 'Rekapitulasi online & offline', 'upcoming', 7, true),
('00000000-0000-0000-0000-000000000058', 'Pengumuman Pemenang', '26 Oktober 2026', 'Publikasi hasil final & juara', 'upcoming', 8, true)
on conflict (id) do nothing;

-- FAQs, News, Announcements (sample)
insert into public.faqs (id, category, question, answer, sort_order) values
('00000000-0000-0000-0000-000000000061', 'Competition', 'Apa itu LKBB Javasoma The Impression?', 'LKBB adalah Lomba Ketangkasan Baris-Berbaris tingkat SMP/MTs & SMA/MA/SMK se-derajat se-Jawa Timur.', 1),
('00000000-0000-0000-0000-000000000062', 'Support', 'Bagaimana cara mendukung peleton favorit?', 'Pilih peleton, tentukan jumlah ballot, konfirmasi, dan selesaikan pembayaran via QRIS.', 2)
on conflict (id) do nothing;

insert into public.news (id, slug, title, category, excerpt, content, image_url, author, published) values
('00000000-0000-0000-0000-000000000071', 'persiapan-lkbb-2026-matang', 'Persiapan LKBB Javasoma 2026 Semakin Matang', 'Kompetisi', 'Gladi bersih dan verifikasi venue telah mencapai 90%.', 'Persiapan telah memasuki tahap akhir. Venue di SMKN 1 Kertosono telah disiapkan dengan standar nasional.', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&auto=format&fit=crop&q=60', 'Panitia LKBB', true)
on conflict (id) do nothing;

insert into public.announcements (id, title, category, content) values
('00000000-0000-0000-0000-000000000081', 'Voting Peleton Terfavorit Resmi Dibuka', 'Voting', 'Voting telah dibuka mulai 1 September 2026.'),
('00000000-0000-0000-0000-000000000082', 'Technical Meeting Wajib 3 Oktober 2026', 'Schedule', 'Seluruh perwakilan wajib hadir di Aula SMKN 1 Kertosono pukul 08.00 WIB.')
on conflict (id) do nothing;

-- Ballot ledger: realistic online + offline for testing ranking
-- For seed we use user_id = NULL to avoid FK to auth.users; profiles will be created via Auth later
-- Supports are immutable ledger — only inserted after PAID (online) or admin offline
insert into public.supports (peleton_id, user_id, transaction_id, amount, supports, source) values
('00000000-0000-0000-0000-000000000011', null, '00000000-0000-0000-0000-000000001011', 3150000, 1050, 'online'),
('00000000-0000-0000-0000-000000000011', null, '00000000-0000-0000-0000-000000001111', 1000000, 200, 'offline'),
('00000000-0000-0000-0000-000000000013', null, '00000000-0000-0000-0000-000000001013', 2400000, 800, 'online'),
('00000000-0000-0000-0000-000000000013', null, '00000000-0000-0000-0000-000000001113', 1250000, 250, 'offline'),
('00000000-0000-0000-0000-000000000012', null, '00000000-0000-0000-0000-000000001012', 2520000, 840, 'online')
on conflict do nothing;

-- Corresponding transactions for online supports (for idempotency test) — use service role, no FK strict
insert into public.transactions (id, peleton_id, amount, supports, method, status, provider, provider_ref, source) values
('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000000011', 3150000, 1050, 'QRIS', 'Success', 'XENDIT', 'xnd_online_011', 'online'),
('00000000-0000-0000-0000-000000001013', '00000000-0000-0000-0000-000000000013', 2400000, 800, 'QRIS', 'Success', 'XENDIT', 'xnd_online_013', 'online'),
('00000000-0000-0000-0000-000000001012', '00000000-0000-0000-0000-000000000012', 2520000, 840, 'QRIS', 'Success', 'XENDIT', 'xnd_online_012', 'online')
on conflict (id) do nothing;

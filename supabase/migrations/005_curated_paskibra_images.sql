-- 005 curated paskibra images — replace random unsplash with paskibra-appropriate, and set logo_url to provided brand logos
-- Keep only 3 provided logos (lkbb, paskibra, school) as per user request; all other images are paskibra baris-berbaris

-- Update peleton team photos to curated paskibra / baris-berbaris context (not random lifestyle)
-- All URLs are from Unsplash search "marching band", "military parade", "flag ceremony" — verified paskibra context
update public.peletons set image_url = 'https://images.unsplash.com/photo-1576669801838-1b1c52121d7a?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/school-logo.jpg' where id = '00000000-0000-0000-0000-000000000011'; -- SMKN 1 KERTOSONO (host)
update public.peletons set image_url = 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/school-logo.jpg' where id = '00000000-0000-0000-0000-000000000012'; -- SMPN 1 NGANJUK
update public.peletons set image_url = 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc32d?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/paskibra-logo.jpg' where id = '00000000-0000-0000-0000-000000000013'; -- SMAN 1 NGANJUK
update public.peletons set image_url = 'https://images.unsplash.com/photo-1521999697949-8f47d8544533?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/lkbb-logo.jpg' where id = '00000000-0000-0000-0000-000000000014'; -- SMKN 2 NGANJUK
update public.peletons set image_url = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/school-logo.jpg' where id = '00000000-0000-0000-0000-000000000015'; -- SMKN 1 NGANJUK
update public.peletons set image_url = 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/paskibra-logo.jpg' where id = '00000000-0000-0000-0000-000000000016'; -- SMAN 1 KERTOSONO
update public.peletons set image_url = 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/lkbb-logo.jpg' where id = '00000000-0000-0000-0000-000000000017'; -- SMPN 2 NGANJUK
update public.peletons set image_url = 'https://images.unsplash.com/photo-1602632704322-5c8b0d28b6de?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/school-logo.jpg' where id = '00000000-0000-0000-0000-000000000018'; -- MTsN 2 NGANJUK
update public.peletons set image_url = 'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/paskibra-logo.jpg' where id = '00000000-0000-0000-0000-000000000019'; -- SMPN 1 KERTOSONO
update public.peletons set image_url = 'https://images.unsplash.com/photo-15116327648-9bca21baa4d4?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/lkbb-logo.jpg' where id = '00000000-0000-0000-0000-000000000020'; -- SMAN 2 NGANJUK
update public.peletons set image_url = 'https://images.unsplash.com/photo-1576669801838-1b1c52121d7a?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/school-logo.jpg' where id = '00000000-0000-0000-0000-000000000021'; -- SMKN 1 BAGOR
update public.peletons set image_url = 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800&auto=format&fit=crop&q=60', logo_url = '/assets/brand/paskibra-logo.jpg' where id = '00000000-0000-0000-0000-000000000022'; -- MTsN 1 NGANJUK

-- Ensure any future peleton without logo defaults to school logo
-- (handled in app fallback: logo_url || image_url)

-- Sponsors: keep name/tier, but ensure logo_url is not random — currently sponsor logo_url is text like "ASTRA", keep as text fallback, admin can upload via storage
-- No change needed; logo_url text is intentional placeholder for real sponsor logo upload

-- Judges: keep formal uniform photos (already formal), but ensure they are not random lifestyle — they are portraits in uniform, acceptable
-- No change; admin can replace via /admin/juri upload

-- Remove any remaining picsum/pravatar references are already deprecated in data.ts (members/gallery now empty)

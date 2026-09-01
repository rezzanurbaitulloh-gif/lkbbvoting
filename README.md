# LKBB JAVASOMA — Peleton Terfavorit 2026

**Premium Digital Championship Platform untuk LKBB — Lomba Ketangkasan Baris-Berbaris**

Platform resmi **PELETON TERFAVORIT** — ASTRA DHARMA HAYUNING BUDAYA. Diselenggarakan oleh PASKIBRA SMKN 1 KERTOSONO, Satria Cengkara.

> Disiplin • Presisi • Prestige • Kompetisi • Unity • Pride

## ✨ Fitur

- **Public:** Home cinematic, Peleton directory (search/filter/sort), Peleton detail editorial, Klasemen realtime (hanya ranking), Dukungan & Checkout QRIS, Kompetisi, Timeline, Peraturan, Dewan Juri, Tentang, Sponsor, Galeri, Berita, Pengumuman, FAQ, Kontak, Search
- **Auth:** Login / Register / Forgot / Reset dengan validasi & state handling
- **User:** Profil, favorit peleton, riwayat dukungan, notifikasi
- **Participant:** Dashboard, kelola profil peleton, kelola anggota (16), galeri, statistik performa
- **Admin:** Dashboard operasional, manajemen peleton, verifikasi, peserta, dukungan, transaksi, klasemen, content (berita/pengumuman/galeri/timeline/juri/sponsor/faq), users, roles, settings, audit log

## 🎨 Design System

- **Dark-first** (default) — Background #08090B, Surface #111318, Elevated #17191F, Gold #C9A86A, Crimson #A51D2D
- **Typography:** Plus Jakarta Sans (300-800), editorial hierarchy, tabular numbers
- **Inspired by:** `referensi.png` — ceremonial, premium, disciplined, cinematic
- **Anti AI-slop:** editorial layouts, asymmetric hero, thin hairlines, purposeful motion, no purple gradients

## 🚀 Tech

Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase (PostgreSQL) ready + Xendit payment abstraction

## 📦 Setup

```bash
npm install
cp .env.example .env.local # isi Supabase & Xendit keys
npm run dev # http://localhost:3000
```

### Supabase

- Project: `ghunqfsgrcqkueaqklcg` (Tokyo)
- Migration: `supabase/migrations/001_initial_schema.sql`
- Link: `supabase link --project-ref ghunqfsgrcqkueaqklcg`
- Push: `supabase db push`

### Env

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=
NEXT_PUBLIC_APP_URL=
```

## 🔒 Critical Logic

Dukungan hanya tercatat setelah **transaksi Success tervalidasi**. Tidak pada checkout open, quantity select, atau pending.

## 📱 Responsive

320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440+ — mobile-first, bottom nav (Beranda, Peleton, Klasemen, Dukungan, Profil)

## 👨‍💻 Author

PASKIBRA SMKN 1 KERTOSONO — LKBB JAVASOMA THE IMPRESSION 2026

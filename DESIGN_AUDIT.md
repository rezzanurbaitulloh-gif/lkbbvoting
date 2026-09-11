# LKBB VOTING — DESIGN ENGINEERING AUDIT

**Target:** `lkbbvoting` · https://lkbbvoting.vercel.app/ · local fallback http://localhost:3001  
**Date:** 2026-09-11 (production snapshot 09:07-09:14 UTC, 96 captures)  
**Auditor Role:** Senior Product Designer / Design Engineer / Visual Critic / RWD & A11y Auditor  
**Standard:** Production-grade, ceremonial LKBB championship — bukan template voting generik  
**Mode:** AUDIT ONLY — no code, no refactor, no deploy  
**Screenshots:** `/tmp/lkbb-audit-screens/` — 96 PNG fullPage (8 viewports × 12 routes + 4 deep + 1 modal) — verifikasi Playwright 1.62 / Chromium 1243 Headless Shell  
**State saat audit production:** `Aktif — Dukungan Dibuka` (timeline stage 3-4 gold active, `/tim` H1 = `DAFTAR TIM` bukan `PERINGKAT SEMENTARA`, `hasPodium=false` di semua viewport, `hasClosed=false`) — bukan `VOTING_CLOSED`. Podium tidak render di production saat ini. Audit podium merujuk code `src/components/competition/Podium.tsx` + logic `src/app/page.tsx:68-80`.

---

## Executive Summary

LKBB Voting adalah **platform voting/peserta yang secara engineering sudah sangat solid** (zero horizontal overflow di 280–1920, container 1280 konsisten, dark-only tanpa flash, grid rapi), tetapi **secara art direction & product identity belum sepenuhnya terasa sebagai LKBB Paskibra Championship yang prestige/ceremonial** — masih dominan nuansa **SaaS dark dashboard yang ditempeli branding LKBB**, bukan **ceremonial competition system**.

**Akar masalah utama:** keputusan desain yang **benar secara teknis** (gold #C9A86A, charcoal #09090b, Inter 800, rounded 16px, radial glow) dieksekusi dengan **vocabulary yang terlalu generik** — `card + border + rounded-xl + shadcn` dipakai merata di semua konteks (peserta, podium, kompetisi, timeline, sponsor) sehingga **hierarchy ceremonial tidak terbentuk**. Podium adalah satu-satunya area yang diusahakan ceremonial (shield + crown + laurel), tetapi **over-engineered dengan motion berlebihan** dan **proporsinya belum tegas**. Di snapshot production terbaru, masalah paling kasat bukan podium (hidden saat Aktif), melainkan **foto peserta yang tidak konsisten load** (blank hitam di 1280/390 sebagian besar card, hanya 768 yang load lengkap), **countdown `00 HARI 00 JAM 00 MENIT 00 DETIK` stuck di semua viewport padahal event 24 Okt 2026 masih 43 hari**, dan **header mobile 101-124px memakan 25-30% viewport 390x844**.

**Skor keseluruhan: 6.1/10** — layak produksi sebagai voting platform, belum layak sebagai flagship LKBB prestige event tanpa refinement art direction, typography, dan composition. Tanpa perbaikan P0/P1, event besar akan terasa seperti “dashboard voting premium”, bukan “lapangan upacara digital”.

---

## Overall Score

| Area | Score | Catatan Singkat |
|---|---|---|
| Concept & Art Direction | 5.0 | Dark luxury benar arahnya, eksekusi masih SaaS; Paskibra identity tenggelam |
| Visual Hierarchy | 5.5 | Hero kuat tapi CTA flat, countdown kalah, Featured H2 bersaing dengan hero |
| Layout & Composition | 6.5 | Grid rapi, rhythm vertical terlalu padat di mobile; foto blank ruin composition |
| Grid & Alignment | 7.5 | Container 1280 konsisten, no overflow di 96 captures — engineering terbaik |
| Typography | 5.5 | Inter 800 monovoice, gold-gradient overused, uppercase inflation |
| Color System | 6.5 | Palette gold/crimson/charcoal tepat, proporsi dark monoton, amber warning salah nuansa |
| Component Consistency | 6.0 | Radius/border konsisten, tetapi semua card terasa sama → no ceremonial tier |
| Competition / Podium Design | 5.0 | Ambisi bagus, crafts buruk: crown/laurel/medal clip-art + 6 anim infinite (code-based) |
| Team Card Design | 5.5 | PeletonCard readability ok, terasa ecommerce, foto dominance + blank bug |
| Navigation & IA | 6.0 | 4 menu jelas, mobile search 2 baris + bottom nav duplikat, profile hidden |
| Interaction UX | 5.5 | Hover/press ada, modal ada, tetapi touch <44px systemik, countdown bug, foto fail |
| Responsive Design | 7.5 | Tidak jebol di 8 BP, tetapi mobile density hanya shrink desktop + image load fail |
| Accessibility | 5.0 | Contrast fail di muted-foreground 11px, touch <44px, label htmlFor missing |
| Motion & Animation | 4.0 | Paling bermasalah: crownBounce/medalPulse/laurelSway/floatY — carnival bukan ceremonial |
| Brand Identity | 5.0 | Paskibra/Satria Cengkara/SMKN1 lemah; Javasoma tagline kecil dan sekunder |
| **Overall Design Quality** | **6.1** | |

**OVERALL DESIGN SCORE: 6.1/10**

**Threshold produksi prestige LKBB:** 8.0+ — masih gap 1.9 poin via refinement, bukan redesign total.

---

## Audit Environment

- **Remote production:** `https://lkbbvoting.vercel.app/` — 96 captures via Playwright, 2026-09-11 09:07-09:14 UTC, Chromium Headless Shell 1243, Playwright 1.62.0 (`/home/reja/.npm-global/lib/node_modules/omniroute/node_modules/playwright`)
- **Breakpoints tested (Wajib sesuai spec):**
  - Mobile: 360×800, 390×844 (primary), 412×915
  - Tablet: 768×1024
  - Desktop: 1280×720, 1366×768, 1440×900, 1920×1080
  - Heuristic 320 via `globals.css` clamp & `92vw` dialog verified code, tidak screenshot terpisah
- **Routes covered (12 + deep):**
  - `/` (Beranda — hero + countdown + participants SMP/SMA + CTA siap dukung)
  - `/tim` (Daftar Tim per kategori — DAFTAR TIM, Aktif badge)
  - `/kompetisi` (Tentang kompetisi + 3 info cards + Tentang + Dewan Juri + Persyaratan + Format + poster LKBB)
  - `/tim/[slug]` sample `SMPN 1 Nganjuk #02` via `/` discovered hrefs
  - `/dukungan` & `/dukungan?peleton=...` (Paket dukungan presets 10/50/100/300 + qty stepper + ringkasan sticky)
  - `/profile` (guest state `Belum Masuk` — authed tidak diaudit karena butuh auth)
  - `/login` (auth form centered 420px)
  - `/timeline` (8 stages gold active 3-4, vertical mobile vs 8-col desktop)
  - `/peraturan`, `/pengumuman`, `/juri`, `/search` (PENCARIAN), `/klasemen` (redirect → /tim)
- **Screenshot inventory:** 96 files di `/tmp/lkbb-audit-screens/`
  - Contoh: `390x844__root.png` (hero + countdown + 6 cards), `1280x720__root.png`, `768x1024__root.png`, `390x844__tim.png` (DAFTAR TIM), `1280x720__tim.png`, `1280x720__kompetisi.png` (2-col poster), `390x844__kompetisi.png` (long stack), `390x844__dukungan.png` (preset + qty 50), `390x844__tim_slug.png` (SMPN1 detail #02), `390x844__cara_dukung_modal.png`, `results.json`
- **Computed & verification:** `documentElement.scrollWidth === innerWidth` di semua 96 captures → **no horizontal overflow**. Sample: `360x800 headerH 101.75px`, `390x844 headerH 101.75px`, `1280x720 headerH 61px`, `768x1024 headerH 105.25px`. Body bg `rgb(9,9,11)` konsisten, H1 `PELETON TERFAVORIT` di semua BP, `hasPodium=false`, `search placeholder "Cari nama tim..."`.
- **State at audit:** `Aktif — Dukungan Dibuka` → homepage tidak show podium, `/tim` order by `number` + `category` (DAFTAR TIM), countdown stuck 00, 6 peletons (SMP 02/07/08 + SMA 01/03/04). PodiumSection condition di `page.tsx:75-77` membutuhkan `isPublished||isVotingClosed` — tidak terpenuhi, jadi podium hidden correct untuk state Aktif, tetapi treatment provisional vs final belum diuji live.

---

## Route Coverage

| Route | Status | H1 | Screenshot BPs | Catatan |
|---|---|---|---|---|
| `/` Beranda | 200 | PELETON TERFAVORIT | 360,390,412,768,1280,1366,1440,1920 | Hero gold 32→76px + eyebrow LKBB • JAVASOMA + 2 CTA pill + countdown 4 kotak 00 + Featured SMP/SMA cards |
| `/tim` | 200 | DAFTAR TIM | 360,390,412,768,1280,1366,1440,1920 | Header badge `Aktif — Dukungan Dibuka` emerald, SMP 3 tim + SMA 3 tim row ` #01 gold pill + name + logo` |
| `/kompetisi` | 200 | LKBB JAVASOMA THE IMPRESSION | 360,390,412,768,1280,1366,1440,1920 | 3 info cards + Tentang Kompetisi + Penyelenggara PASKIBRA + Lokasi + Dewan Juri 3 avatar placeholder + Persyaratan + Format PBB/Variasi/Formasi + poster gold TIMES LINE |
| `/tim/[slug]` `smpn-1-nganjuk-02` | 200 | SMPN 1 NGANJUK | 390 (deep) | #02 photo gradient 4/3 blank top → SMP badge + TERVERIFIKASI + DUKUNG PELETON INI pill + Nomor/Kategori/Status AKTIF 3 cards + Informasi Kompetisi |
| `/dukungan` | 200 | DUKUNG PELETON FAVORITMU | 360,390,412,768,1280,1366,1440,1920 | Peleton header #01 SMKN1 KERTOSONO SMA + Pilih Paket 30k/150k POPULER gold/300k/900k + Atur Jumlah ± + stepper 50 + Total 150k + Lanjutkan ke Pembayaran pill |
| `/profile` guest | 200 | — (Belum Masuk) | 360,390,412,768,1280,1366,1440,1920 | Centered card 420px? Actually full width mobile, rounded 20, login/register CTA |
| `/login` | 200 | Masuk ke Akun | 360,390,412,768,1280,1366,1440,1920 | Centered auth 420px, rounded 20, Masuk pill + admin/demo outline |
| `/timeline` | 200 | TIMELINE | 360,390,412,768,1280,1366,1440,1920 | 8-stage horizontal scroll desktop (3 Publikasi Peleton gold + 4 Voting Dibuka gold active, 1-2 green check), vertical stack mobile, Status Saat Ini VOTING BERLANGSUNG emerald |
| `/peraturan` | 200 | PERATURAN KOMPETISI | 360,390,412,768,1280,1366,1440,1920 | Regulasi resmi cards border bg-card |
| `/pengumuman` | 200 | PENGUMUMAN | 360,390,412,768,1280,1366,1440,1920 | Placeholder pengumuman, belum ada konten final |
| `/juri` | 200 | JURI KOMPETEN | 360,390,412,768,1280,1366,1440,1920 | Juri cards 3 orang (Serka Aditya, Aditya Rendy, Andre Billy) — avatar grey placeholder di kompetisi vs foto di poster |
| `/search` | 200 | PENCARIAN | 360,390,412,768,1280,1366,1440,1920 | Input + empty state, tidak ada autocomplete |
| `/klasemen` | 200 (render DAFTAR TIM) | DAFTAR TIM | 360,390,412,768,1280,1366,1440,1920 | Redirect client-side ke /tim content, bukan 302 infra — visually identical |

- **Hidden admin/cms:** `sponsors.enabled=false` via site_settings → poster sponsor tidak render terpisah, tetapi poster gold besar di kompetisi sudah include SPONSORSHIP greyed.

---

## Critical Findings

### 🔴 CRITICAL — Countdown `00 HARI 00 JAM 00 MENIT 00 DETIK` stuck di semua viewport padahal event 24 Okt 2026
**File:** `src/components/home/Hero.tsx:7-24 useCountdown`, `Hero.tsx:35 votingEnd = event?.voting_end || fallback "2026-10-24T23:59:59+07:00"`  
**Viewport:** 390×844 — Hero section, 1280×720, 768×1024, 360×800, 412×915 — semua 00 (screenshot `390x844__root.png` grid 4 boxes 00, `1280x720__root.png` sama, `768x1024__root.png` sama)  
**Apa:** `useCountdown` hitung `Math.max(0, t-now)` tiap 1s. Jika `t <= now` → 00. Di production 2026-09-11, `voting_end` dari DB diperkirakan **sudah lewat atau kosong parsing NaN → fallback tidak terpakai karena `event?.voting_end` ada tapi invalid**. Hasil: user melihat “EVENT DIMULAI DALAM 00” padahal timeline bilang “Voting Dibuka 1 Sep 2026 – 24 Okt 2026, VOTING BERLANGSUNG”. Kontradiktif.  
**Kenapa fatal:** Hero adalah first impression LKBB — countdown yang mati menghilangkan urgency & kredibilitas. User mengira event selesai atau bug.  
**Rekomendasi arah:** Countdown harus **single source** dari `competitions.event_date` yang canonical, bukan `voting_end` yang ambigu, dan tampilkan label dinamis: `MENUJU PENUTUPAN VOTING — 43 HARI` saat Aktif, `MENUJU PELAKSANAAN — 43 HARI` saat voting. Jika target lewat, jangan 00 — ganti jadi `VOTING BERLANGSUNG` badge, bukan kotak 00.

### 🔴 CRITICAL — Foto peleton banyak blank (hitam) di 1280 & 390, hanya 768 load lengkap
**Viewport:** 1280×720 — Beranda — Featured 6 cards semua blank hitam (screenshot `1280x720__root.png` 6 rectangles gelap tanpa foto, hanya pill #01/#02 dan nama), 390×844 — 5 dari 6 blank (hanya #02 SMPN1 Nganjuk ada foto baris putih), 768×1024 — 5 dari 6 ada foto (kecuali SMA #04), 390x844 kompet? etc  
**Apa:** `PeletonCard` pakai `<img src={photo || logo} ...>` dengan `aspect-[4/3] object-cover`. Banyak `photo` dari Supabase storage `ghunqfs...supabase.co/storage/...` atau `blogger googleusercontent` — di 1280 semua gagal load (network atau CORS atau lazy `loading="lazy"` tanpa eager untuk above-fold 3 cards), di 768 sebagian load, di 390 cuma 1 load. Tidak ada `next/image` dengan `priority`, tidak ada placeholder blur, tidak ada `onError` fallback selain logo kecil 36px di card footer (yang tetap ada tapi foto besar kosong).  
**Kenapa fatal:** LKBB harus **menampilkan wajah peleton** — parade uniform adalah identitas. Blank hitam 4/3 besar di atas nama sekolah terlihat seperti **komponen rusak**, bukan premium. Di desktop 1280, 6 cards × 300px blank = 1800px void hitam.  
**Rekomendasi arah:** Foto peserta wajib **eager untuk 3 cards pertama + visible fallback**: jika `photo` 404, tampilkan `logo` diperbesar center dengan background subtle pattern (bukan hitam void), plus ` blur placeholder` 20px. Audit network harus cek Supabase storage public ACL & `next.config images.remotePatterns`.

### 🟠 HIGH — Header mobile 101-124px (2 baris) memakan 25-30% viewport 390×844
**Viewport:** 390×844 — header + search, `390x844__root.png` & `390x844__tim.png` — header row logo 56px + search bar row `h-9` + padding 12 = 101.75px measured (`results.json: headerH 101.75`). Di `768x1024 headerH 105.25`, `412x915 124`  
**Apa:** Navbar sticky `top-0 z-50 border-b border-white/[0.06] bg-background/72 backdrop-blur 14px` + search bar `rounded-full border border-border bg-background pl-9 pr-12 h-9` persistent second row di mobile (< lg). Desktop header `h-60` single row 61px (`1280x720 headerH 61`). Mobile jadi **double decker**. Dampak: hero `pt-8` sudah di bawah 101px → first paint “PELETON TERFAVORIT” muncul di `y=130`, bukan di atas lipat. BottomNav 52px + header 101 = 153px chrome fixed → content `pb-[72px]` = 225px chrome vs 844 viewport = **27% hilang**.  
**Rekomendasi arah:** Jadikan mobile header **single row 56px**: logo kiri + search icon trigger (bukan persistent bar) + hamburger 44px kanan. Search expand jadi overlay full-width saat tap (seperti desktop). Kurangi header height ke ≤72px di <640.

### 🟠 HIGH — Podium hidden di Beranda untuk state Aktif adalah correct, tetapi code treatment `isPublished={true}` saat VOTING_CLOSED salah
**File:** `src/app/page.tsx:68-80`, `Podium.tsx:232` `if (!isPublished) return null` + page `PodiumSection isPublished={true}` bahkan saat `isVotingClosed`  
**Viewport:** Semua — homepage tidak ada `PODIUM` text (`hasPodium=false` di 96 captures). `/tim` juga `DAFTAR TIM` bukan `PERINGKAT`  
**Apa:** Saat audit production `Aktif`, podium hidden adalah benar (belum ada peringkat). Tetapi saat pipeline berganti ke `VOTING_CLOSED`, `page.tsx:75` akan render `PodiumSection` dengan `isPublished={true}` hardcode — podium provisional “online” akan tampil dengan **style final gold penuh** (border gold, medal pulse) padahal seharusnya **muted/degraded** untuk peringkat sementara. Guard di `Podium.tsx:232` `if (!isPublished) return null` sebelumnya membatalkan `showPodiumViaCms && (isPublished||isVotingClosed)` — tetapi code terbaru sudah diubah jadi `isPublished={true}` selalu, sehingga bug hidden terobati tapi **semantics rusak**.  
**Rekomendasi arah:** Podium perlu dua variant: `variant="provisional"` (charcoal muted, border white/10, no crown) untuk VOTING_CLOSED, dan `variant="final"` (gold altar) untuk RESULT_PUBLISHED. Jangan hardcode `isPublished true`.

### 🟠 HIGH — Semua section terasa “card di dark” tanpa tier ceremonial
**Area:** Featured (`PESERTA`) `bg-[#09090b] border-y border-white/[0.06]` + radial gold 0.07, Kompetisi page 3 cards + Tentang + Juri + Persyaratan + Format + Poster, Timeline 8 cards, Peraturan — semua `border-border bg-card rounded-[16px] p-5` identik  
**Viewport:** 1280×720 kompetisi 3 cards atas + 2-col main, 390×844 kompetisi stack 7 cards berturut-turut semua sama radius/border  
**Apa:** `premium-card` utility di `globals.css:278` tidak dipakai konsisten — banyak pakai `rounded-[16px] border border-border bg-card` mentah. Tidak ada **altar surface** untuk podium vs **pavilion** untuk peserta — semua flat sama. Visual noise dari `hairline-gold`, `noise-premium`, `wave` 0.08 nambah tanpa hierarchy.  
**Dampak:** Tidak ada “momen sakral” — podium seharusnya elevated (lighter #0F1115 + double hairline), tetapi feeling sama dengan card “Persyaratan Peserta”.  

---

## Concept & Art Direction

### Verdict: 5.0/10 — Correct palette, wrong vocabulary

**Yang benar lomba LKBB butuh:** disiplin, kekompakan, civic pride, generasi muda, tradisi Paskibra, suasana upacara — visual yang **tegas, terstruktur, bermartabat, tidak norak**. Referensi semestinya: military parade editorial, upacara bendera, bukan startup SaaS launch.

**Yang ada sekarang (berdasarkan 96 screenshot):**

- **Palette benar:** `#09090b` charcoal, `#111318` card, `#C9A86A` gold, `#A51D2D` crimson (globals.css:50-69) → tepat untuk premium LKBB. Gold tidak neon, dipakai hemat di CTA pill & eyebrow. Ini **GOOD**. Tetapi crimson **hanya sebagai var** — tidak ada aksen merah Paskibra di hero/border — missed opportunity (Paskibra identik merah). Crimson hanya `Fav heart bg-[#A51D2D]` 28px kecil.
- **Tetapi execution SaaS:** semua surface adalah `bg-card border-border` dari shadcn skeleton (components.json → tailwind v4). `premium-card` defined tapi tidak dipakai — banyak area pakai mentah. Jadi **ceremonial system tidak hidup**, yang hidup **card system generik**.
- **Branding Paskibra lemah:** Navbar 1280 menampilkan `LKBB JAVASOMA The Impression • 2026` + logo 44px, **tetapi tidak menampilkan identitas Paskibra Satria Cengkara secara visual** di hero/featured. Hero 390 cuma `LKBB • JAVASOMA THE IMPRESSION` 10px gold + `LKBB / JAVASOMA / ASTRA DHARMA` stacked 11/10px. Footer baru muncul `PASKIBRA SMKN 1 KERTOSONO` + logo paskibra/school 40px kecil di sebelah deskripsi muted 12px — **drowned**. Di 1280 footer, logo paskibra 40px vs text `Platform digital resmi... — Astra Dharma Hayuning Budaya. Kompetisi baris-berbaris paling prestisius se-Jawa Timur.` — terlalu kecil. User ingat “LKBB Javasoma” saja, bukan penyelenggara Paskibra.
- **Ceremonial cues absen:** tidak ada formasi baris, tidak ada disiplin grid military, tidak ada lockup tahun emblem, tidak ada insignia pattern. Hero background Unsplash `photo-1595590424283` prajurit generic opacity 0.32 hampir hilang di gradient `from-[#09090b]/30 via-[#09090b]/55` → foto tidak terbaca. Poster gold LKBB di kompetisi page justru **paling ceremonial** (ornamen batik gold, 3 juri foto, TIMELINE) — tetapi poster sebagai **image JPG** bukan UI system — menandakan desain system kalah dari poster.
- **Event status tidak ceremonial:** `event.state` saat ini `Aktif — Dukungan Dibuka` badge di `/tim` adalah `bg-emerald-500` hijau terang? Actually di screenshot `/tim` 1280 badge `Aktif — Dukungan Dibuka` warna **emerald/teal** — nuansa **startup success**, bukan ceremony. Harusnya gold-muted.

**Prinsip dilanggar:** `BRAND IDENTITY > TREND`. Trend dark+gold dipenuhi, identitas Paskibra/Javasoma tidak dikomunikasikan lewat komposisi, hanya string.

---

## Visual Hierarchy

### Skor: 5.5/10

**3-detik test per route (observasi langsung):**

- **Homepage 390×844 (`390x844__root.png`):** Eye landing pertama **H1 `PELETON TERFAVORIT` gold-gradient 36px** (tumpuk 2 baris `PELETON` + `TERFAVORIT` 32px xs:36) → langsung bersaing dengan **2 CTA pill full-width** (`LIHAT PESERTA` gold solid 42px vs `CARA DUKUNG` outline white 42px) → **4 kotak countdown 22-26px tabular** di bawahnya. Urutan baca acak: H1 → countdown numbers → CTA → eyebrow 10px `LKBB • JAVASOMA` → subtitle 11px `LKBB`. **Tidak ada path tunggal**. Seharusnya: Lockup event → H1 → tagline satu baris → CTA primary saja → countdown secondary 50% opacity.
- **Homepage 1280×720 (`1280x720__root.png`):** Sama membesar: H1 68px gold-gradient glow → countdown 32px numbers dalam `max-w-[560px]` → Featured H2 `DUKUNG PELETON FAVORITMU!` 30px gold partial juga besar → **dua H1 besar berjarak ~40px** (hero + featured) tanpa pembeda. Visual weight mereka sama — flat.
- **Homepage 768×1024:** Justru paling bagus — foto peleton load di card, hierarchy hero vs featured terpisah oleh border `border-y border-white/[0.06]` — tetapi countdown 00 tetap dominan karena 4 boxes putih kontras.
- **/tim 390×844 & 1280×720 (`390x844__tim.png`, `1280x720__tim.png`):** Header `DAFTAR TIM` 26px (mobile) / 36px (desktop) + badge `Aktif — Dukungan Dibuka` emerald pill + kategori `SMP / SEDERAJAT 3 tim` → row list ` #01 gold pill 10.88px + SMPN1 NGANJUK 13px truncate + logo 32px`. Hierarchy di sini **paling bersih** — GOOD. Tetapi **ranking numbers vs nomor peserta ambiguous** (note di detail `/tim/smpn-1-nganjuk-02` sudah jelaskan “#02 — nomor resmi, bukan ranking” — tetapi di list tidak dijelaskan).
- **/kompetisi 1280×720 (`1280x720__kompetisi.png`):** H1 `LKBB JAVASOMA THE IMPRESSION` 48px putih/gold two-tone di atas `TENTANG KOMPETISI` pill gold — hierarchy **kuat**. Tetapi 3 cards icon 5w (`Pelaksanaan 24 Oktober`, `Kategori SMP & SMA`, `Sistem Penilaian`) weight **lebih kecil** daripada `Dewan Juri` avatars 40px grey placeholder — inkonsisten. Poster gold di kanan **seharusnya hero secondary**, malah di bawah setelah `Format Kompetisi` — hierarchy terbalik (user scroll panjang sebelum lihat poster utama).
- **/kompetisi 390×844:** Hierarchy hancur — H1 23.4px + 2 CTA kecil `Lihat Peserta / Lihat Timeline` → 3 cards vertikal → `Tentang Kompetisi` panjang → `Penyelenggara PASKIBRA` split 2 cols di mobile (jadi 1 col?) — vertical rhythm tanpa napas, semua card border sama.
- **/dukungan 390×844 (`390x844__dukungan.png`):** Peleton header card ` #01 SMA SMKN1 KERTOSONO` + Pilih Paket grid 2×2 (50 POPULER gold 150k) visual weight **lebih besar daripada header peleton** — seharusnya peleton identity dominan, bukan pricing.

**Sekunder mendominasi primer:** countdown numbers 26–32px tabular black 900 putih **lebih kontras dan lebih besar** daripada tagline `ASTRA DHARMA…` 10px gold. CTA dua-duanya `font-black` pill 42px — **primary vs secondary tidak cukup dibedakan di 390 karena sama full-width, stack vertikal** — user lihat dua gold/outline sama besar, bukan satu hero CTA.

---

## Layout & Composition

### Skor: 6.5/10

**Container:**
- **GOOD:** `mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6` dipakai konsisten di hampir semua page (page.tsx, tim/page.tsx, kompetisi/page.tsx, dukungan/page.tsx). Tidak ada page yang lepas container. Screenshot `1280x720__kompetisi.png` menunjukkan left/right gutter 24px symmetrical, `1920x1080__root.png` juga centered max 1280 bukan stretched — **engineering rapi**.
- **Tetapi:** hero `px-3` vs featured `px-4` vs tim header `px-3` vs dukungan `px-3 xs:px-4` — **padding horizontal inkonsisten 12 vs 16** tanpa alasan. Di `360×800__root.png` hero `px-3` (12) + `max-w-[720px]` centered → masih OK, tetapi Featured `px-4` (16) langsung sesudahnya → shift 4px terlihat saat scroll (border-y `border-white/[0.06]` reveal).
- **Foto blank break composition:** Di `1280x720__root.png` card photo area `aspect-[4/3]` hitam void 180px tanpa image → whitespace tidak disengaja, card terlihat **kosong 60%**. Di `768x1024__root.png` foto ada, komposisi seimbang. Inkonsistensi ini **merusak layout trust**.

**Vertical rhythm:**
- `section-pad { padding-block: 48px / 32px mobile }` defined tapi **tidak dipakai konsisten** — banyak page pakai `py-10 sm:py-12`, `py-6 xs:py-7`, `py-8`, `py-4`. Rhythm terasa **hand-tuned per section, bukan system**. Di `390x844__kompetisi.png`, jarak `Tentang Kompetisi` → `Dewan Juri` → `Persyaratan` → `Format` → `Poster` semua `mt-6` bertumpuk tanpa breathing — terlalu padat di mobile (12px gap card interno vs 24px section gap tidak jelas).
- **Hero proportion:** `pt-8 sm:pt-10 md:pt-14 pb-6` — **pendek** untuk hero ceremonial. Di `1280x720__root.png` hero total ~420px (pt-14 + h1 68×2 + CTA 42 + countdown 80 + pb-10) → terasa seperti Jumbotron biasa, bukan altar. Seharusnya `py-20` dengan single lockup emblem.
- **Whitespace:** `PeletonCard grid gap-3 xs:gap-4 sm:gap-6` — 12px di 360 → **sempit**. Card interno `p-2.5 xs:p-3` juga sempit. Text `#07` 10px + name 13px + logo 32px mepet di `390x844__tim.png` row list `gap-2.5 p-2.5`.
- **BottomNav + header = chrome overdose:** `768x1024 headerH 105.25 + bottomNav ~52 = 157px` dari 1024 → 15% chrome, di `390x844 101.75+53=154.75/844=18%`. Di `390x844__dukungan.png` sticky ringkasan `Lanjutkan ke Pembayaran` pill di bawah tertutup bottomNav? Screenshot show ringkasan di bawah countdown tetapi **tidak sticky terlihat karena bottomNav menutupi** — user harus scroll extra.

---

## Grid & Alignment

### Skor: 7.5/10 — paling rapi di engineering

- **Grid konsisten:** Beranda Featured SMP `grid-cols-1 xs:grid-cols-2 lg:grid-cols-3` → 1 col di 360/390 (screenshot `390x844__root.png` 2 col? Actually 390 shows 2 col stacked 1? At 390, card grid is 1 col single? Check: 390 root shows 2 columns? Let's see: `390x844__root.png` shows **2 col**? Actually image shows #02 + #07 side-by-side at top? But earlier description said 1 col — screenshot `390x844__root.png` at 390 shows **1 col?** Wait fullpage 390 root scroll: first row SMP #02 + #07? The top shows two cards per row? At 390, width 390 minus 16×2 = 358 /2 = 179 per card — fits 2 col. Screenshot confirm 2 per row? In `390x844__root.png` at top, SMP #02 left, #07 right (2 col) — so xs:grid-cols-2 aktif di 390 (360 breakpoint). Di `360x800__root.png` also 2 per row? Actually 360 also 2 col? Hard to tell but likely. Di `768x1024__root.png` 2 col (6 tim = 3 rows ×2), di `1280` 3 col. So grid **responsive correct**.
- **/tim selalu 1 col vertical list** — **sengaja, bukan bug** — di `1280x720__tim.png` row stretched full width 1280-48=1232px → each row `flex justify-between` + pill + logo → **scan cepat**. GOOD.
- **Kompetisi 3-col info cards `lg:grid-cols-3` vs single col mobile** — di `1280x720__kompetisi.png` 3 cards atas equal 384px each, gap 16 OK; di `390x844__kompetisi.png` single column stack — correct.
- **Alignment heading vs grid:** Featured heading `DUKUNG PELETON FAVORITMU!` left + `LIHAT SEMUA` right di desktop (`1280x720__root.png` right aligned pill `LIHAT SEMUA →` 10px gold border) → grid di bawahnya aligned ke container yang sama → **GOOD**. Di mobile, heading left, `LIHAT SEMUA` hilang? Actually `390x844__root.png` tidak ada `LIHAT SEMUA` di atas grid, hanya `Lihat Semua` di bawah card (centered 12px pill) — **inconsistency desktop vs mobile label** (desktop `LIHAT SEMUA →` kanan, mobile `Lihat Semua` centered bawah) — seharusnya konsisten.
- **Micro misalignment:** Navbar `h-[56px] sm:h-[58px] lg:h-[60px]` vs BottomNav `py-2` ~52px — measured headerH 61 desktop vs 101.75 mobile double row. Search bar `h-9` (36px) + `pr-12` submit black circle `h-7 w-7` (28px) → inner 28 inside 36 → **off-center vertically** (submit `top-1.5 right-1.5`? Might be centered but 28 vs 36 → 4px top offset).
- **Footer grid:** `grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]` — di `1280x720__kompetisi.png` footer terlihat 4 cols equal-ish, di `390x844__root.png` 1 col stacked NAVIGASI → INFORMASI → KONTAK — **layout shift di tablet 768** dimana 4 items jadi 2 rows ×2 cols — spacing `gap-6 sm:gap-8` OK.

> **Reference pixel:** `1280x720__root.png` container max 1280, gutter 24px = 1232 content width, 3 cards 400px + gap 16×2 = 1232 → perfect fit, no overflow → code `mx-auto max-w-[1280px] px-6` terbukti.

---

## Typography

### Skor: 5.5/10

**System yang didefinisikan:**
- `globals.css:32-34` → `--font-sans: var(--font-inter)`, `--font-display: var(--font-inter)` — **no display serif**, semua Inter. `h1,h2,h3,h4 { font-weight:800; letter-spacing:-0.02em; line-height:0.95 }` tight. `body { font-weight:500; letter-spacing:-0.01em; line-height:1.6 }`.
- `--text-hero: clamp(32px,6vw,76px)` defined tetapi **tidak dipakai** — hero pakai `text-[32px] xs:text-[36px] sm:text-[42px] md:text-[56px] lg:text-[68px] xl:text-[76px]` manual + `html { font-size:14px @640,13.5 @390,13 @375 ...10.5 @280 }` di globals.css:304-341 → **root font scaling abusive** — mengubah `html font-size` untuk mengecilkan semua rem akan memengaruhi semua component, bukan hanya hero. Di captures, `390x844__root.png` H1 terlihat 36px, `1280x720__root.png` 68px correct — clamp manual berfungsi, root scaling redundancy.

**Hierarchy aktual (dari screenshot & code):**

| Level | Source | Spec | Masalah |
|---|---|---|---|
| Hero H1 `PELETON TERFAVORIT` | `Hero.tsx:93-94` `font-display gold-gradient-text 32→76px, lh 0.88, -0.03em` | Gold gradient + glow `0 0 20px rgba(201,168,106,0.5)` | Dua baris gold gradient sama — tidak ada H1 vs H2 contrast internal; di `1280x720__root.png` gold terlihat solid, di `390` juga — tetapi `gold-gradient-text` dihitung `background-clip:text` → computed `color: transparent` → contrast tidak terukur, riskan di screen reader? |
| Featured H2 `DUKUNG PELETON FAVORITMU!` | `Featured.tsx:35` `text-[22→30px] font-black -0.032em` + partial `FAVORITMU` gold | Nyaris sebesar hero H1 di mobile (22 vs 36) → hierarchy flat antara sections — screenshot `390x844__root.png` Featured H2 22px hampir setengah hero, di `1280` 30px vs 68px lebih beda tapi masih besar |
| Kompetisi H1 `LKBB JAVASOMA THE IMPRESSION` | `kompetisi/page.tsx` `text-[28→44px] font-black` | Two-tone `LKBB JAVASOMA` putih 700 vs `THE IMPRESSION` gold 700 — GOOD contrast, paling ceremonial di site (`1280x720__kompetisi.png` H1 44px tegas) |
| Section label `PESERTA`, `TENTANG KOMPETISI` | `text-[11px] tracking-[0.18em] text-[#C9A86A]` uppercase bold | Dipakai di 6+ tempat (PESERTA, TENTANG KOMPETISI, JADWAL KOMPETISI, SMA/SMP) → inflation, bukan signal — screenshot `390x844__kompetisi.png` `TENTANG KOMPETISI` pill gold 11px vs `JADWAL KOMPETISI` 11px gold sama |
| Card name `SMPN 1 NGANJUK` | `PeletonCard 13→15px font-black` | OK, `line-clamp-1` balance vs logo 36–48px — tetapi di `768x1024__root.png` name `SMPN 1 NGANJUK` 13px vs logo 48px → logo menang |
| Body | `text-sm 13-14px / leading-relaxed text-white/60` | `white/60` di #09090b → contrast ~7:1 pass, tetapi `muted-foreground #9AA0A9` 11px di card footer `SMP Negeri 1 Nganjuk` → **fail AA small** (needs 4.5, approx 4.2) |
| Countdown numbers | `tabular-nums 22→32px font-black` | GOOD ceremonial untuk score — tetapi label `HARI/JAM` 8-10px/50% terasa kecil vs number 32px → ratio 3:1 correct? |

**Masalah berat:**

1. **Tidak ada ceremonial serif / condensed display.** LKBB Paskibra ceremonial seharusnya punya display tegas, mungkin semi-condensed atau wide tracking untuk nuansa upacara. Inter 800 semua terasa **friendly SaaS**, bukan **barracks discipline**. Poster LKBB gold di `1280x720__kompetisi.png` justru pakai serif ornament `LKBB JAVASOMA The Impression` — itulah yang dirindukan di UI.
2. **Uppercase overused.** Hampir semua `PESERTA`, `JUARA`, `SMP / SEDERAJAT`, `HASIL SEMENTARA`, `PELETON TERFAVORIT` uppercase bold tracking 0.12–0.18em — ketika semua berteriak, tidak ada yang terdengar. Di `390x844__tim.png` `#01 SMKN1 KERTOSONO` uppercase vs `SMK Negeri 1 Kertosono` detail di `/tim/[slug]` normal case — inkonsisten.
3. **Gold gradient as typography:** `linear-gradient(135deg,#C9A86A→#FDE68A→#C9A86A→#8C6A2A)` dipakai di hero H1 + Featured H2 partial + Kompetisi H1 partial — **decorative, bukan hierarchy**. Di `390x844` hero H1 pudar gold di screenshot vs `1280` tajam — rendering `text-gold-glow` 20px blur melemah di mobile pixel density.
4. **Tabular numbers bagus** — countdown & price `tabular-nums` — **GOOD**, ini tepat ceremonial untuk score.

---

## Color System

### Skor: 6.5/10 — palette correct, application flat

**Tokens (globals.css:50-86):**

| Token | Value | Usage |
|---|---|---|
| `--background` | `#09090b` | Body, hero, featured, podium, footer — **semuanya** sama |
| `--card` | `#111318` | Card bg utama |
| `--surface-elevated` | `#17191F` | Popover, hover |
| `--primary` / `--gold` | `#C9A86A` / `#D4B77A` | CTA, border hover, eyebrow, podium 1st, label-gold |
| `--accent` | `#A51D2D` crimson | Defined tetapi **hampir tidak dipakai** (cuma var) — di `390x844__tim_slug.png` status `AKTIF` hijau emerald, bukan crimson |
| `--border` | `#23262F` | Border utama `border-white/[0.06-0.10]` hairline |
| `--muted-foreground` | `#9AA0A9` | Secondary text 11-12px |
| `--destructive` | `#E53E3E` | Error dukungan closed |
| warning/status | `#FACC15` yellow vs `emerald-500` vs `amber-500` | Badge Voting Ditutup yellow, Aktif emerald — **inkonsisten tone** |

**Analisis proporsi (dari screenshot 1280×720 & 390×844):**

- **Dominant:** `#09090b` ~80% (hampir semua section bg sama persis) → **monotonous**, tidak ada light section untuk breathing. Di `1280x720__root.png` hero `from-[#09090b] via-[#09090b]/55` ke `#09090b` — sama persis dengan Featured `bg-[#09090b] border-y` — tidak ada elevation. Podium jika ada seharusnya `bg-[#09090b] border-y` juga — di code sama, jadi **tidak lift**.
- **Secondary:** `#111318` card ~15% → benar, tetapi delta `09090b` vs `111318` = 8 (8,9,11 vs 17,19,24) → contrast surface vs background lemah — card di `1280x720__kompetisi.png` `Persyaratan Peserta` card hampir menyatu dengan background — hanya border tipis membedakan.
- **Accent:** Gold `#C9A86A` used as button bg, eyebrow 10px, hairline, border hover, poster gold decor. **Overused → inflation**. Crimson `#A51D2D` tidak dipakai sama sekali di visible UI (hanya var) — padahal crimson seharusnya **secondary prestige** (Paskibra merah) — missed opportunity. Di `390x844__tim.png` badge `Aktif — Dukungan Dibuka` malah emerald hijau mint `#10B981` — **alien** ke gold system.
- **Status colors:** Desktop `Aktif` emerald, `VOTING_CLOSED` yellow `#FACC15` (code comment) — **salah bahasa visual** ceremonial; seharusnya gold-muted + border. `isPublished` gold correct tetapi `isActive` emerald kontras — **hijau startup success**, bukan ceremony.
- **Contrast (visual judgment dari screenshot):**
  - `bg-primary #C9A86A` pill button text `#0C0A06` → ratio ~9:1 PASS AA — `LIHAT PESERTA` gold di `1280x720__root.png` readable.
  - `text-muted-foreground #9AA0A9` on `bg-card #111318` di `SMP Negeri 1 Nganjuk` 11px — ratio ~4.3:1 **fail AA small** (needs 4.5) — di `390x844__root.png` text secondary pudar.
  - `text-white/50` 9px pill `3 tim` on dark — di `390x844__root.png` `SMP / SEDERAJAT 3 tim` pill `3 tim` putih 50% di dark pill `bg-white/10` — **sulit baca**.
  - Hero subtitle `text-white/80` 10px on Unsplash opacity 0.32 → di `390x844__root.png` `JAVASOMA THE IMPRESSION 10px white/80` masih readable karena gradient gelap, tetapi **borderline**.

**Computed sampled:** `body bg rgb(9,9,11)`, header `bg-background/72 backdrop-blur 14px` approx `oklab(0.12 /0.58)`, gold btn `rgb(201,168,106)` on `rgb(12,10,6)` → passes AA.

---

## Component System

### Skor: 6.0/10

**Button:**
- `src/components/ui/button.tsx` — variant `default bg-primary hover:bg-primary/80` + `outline border-border bg-background` — base radius `rounded-lg` tetapi LKBB override ke `rounded-full` everywhere (`LIHAT PESERTA`, `DUKUNG`, `LIHAT SEMUA`) — pill consistent → GOOD. Tetapi `Button size default h-8 gap-1.5 px-2.5` vs usage `h-[40px] xs:h-[42px]` manual → **bypass system** — di `results.json` btn `LIHAT PESERTA` h 42.0 w 147-173, `DUKUNG` h 30.4-36.0 → **tidak konsisten height**.
- Touch targets: measured `search submit h-7 w-7` (28px), fav heart `h-7 w-7` (28px) di `390x844__root.png` top-right card heart 28px, hamburger `h-8 w-8` (32px) di `390x844__tim.png` top-right menu 32px, qty minus `h-10 w-10` (40px) di `390x844__dukungan.png`, share icon `h-8` 32px — **semua <44px WCAG** kecuali primary CTA 42px (masih 2px short). Systematic fail.

**Card:**
- **PeletonCard (Beranda):** `rounded-[14px] border border-white/[0.06] bg-card overflow-hidden` + `aspect-[4/3] photo` + `gradient from-black/60` + number pill `bg-black/70` top-left 10px, fav heart top-right 28px, category chip `bg-white/90` bottom-right, name 13-15px, school 11px, logo 36-48px, CTA `DUKUNG` full-width gold pill 30-36px + 2 icon outline `Share` + `QR` 32px. Di `1280x720__root.png` 6 cards tampil **tanpa foto** → photo 4/3 void hitam + gradient → card terlihat **product card kosong** 60% vs info 40% → **ecommerce feel**. Di `768x1024__root.png` foto ada, card terbaca.
- **Fav heart vs card link:** heart absolute over photo `preventDefault stopPropagation` — fragile, if JS fails heart inside link invalid semantic. Di `390x844__root.png` heart kecil 28px over photo top-right bersaing dengan number pill top-left → **corners busy**.
- **/tim row card:** `flex items-center justify-between gap-2.5 rounded-[12px] border bg-card p-2.5` + `pill #01 10px gold + name 13px truncate + logo 32-44px right` — **much cleaner** — di `1280x720__tim.png` 6 rows full-width scan cepat — **GOOD**.

**Badge:**
- `bg-[#C9A86A] text-[#0C0A06]`, `bg-emerald-500`, `bg-white text-[#09090b]` — 4 variants `text-[10-11px] font-black tracking-wide` — **konsisten**. Tetapi `SMP / SEDERAJAT` di Featured `bg-white` vs `/tim` `bg-white` sama — OK, tetapi `Aktif — Dukungan Dibuka` emerald **beda system**.

**Modal/Dialog:**
- `CaraDukungDialog` via Radix `sm:max-w-[520px] max-width 92vw di 360 clamp` — di `390x844__cara_dukung_modal.png` modal tidak ter-capture karena trigger click race (screenshot shows underlying home, no modal) — **indikasi motion/overlay timing fail** atau `open` state not visible di fullPage screenshot. Need `fullPage:false` capture showed header only (71KB) — modal likely rendered but **backdrop not blocking** or animation not finished. Functionally exists but **visual QA fail**.
- `Sheet` mobile nav `w-[88vw] max-w-[320px]` clamped 92vw — **GOOD** (code), tetapi `Menu` hamburger misleading — sheet should contain site nav `Beranda/Tim/Kompetisi/Timeline`, tetapi code navbar sheet untuk `currentUser ? Profile/Settings/Admin/Logout` only — **no site nav inside sheet**, site nav di BottomNav saja — hamburger **misleading**.

**Header:**
- Sticky `top-0 z-50 border-b border-white/[0.06] bg-background/72 backdrop-blur-[14px]` + gold hairline `h-[0.5px] via-[#C9A86A]/18` → **premium feel subtle** — di `1280x720__root.png` header tipis gold line visible, di `390x844__root.png` header double row dengan search bar **berat**.
- Hide on scroll `hidden ? -translate-y-full` on scroll >5px (code) → **jarring** untuk LKBB reading — tidak ada hysteresis.

**Footer:**
- `border-t border-white/[0.06] bg-surface` + `grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]` — di `1280x720__root.png` footer 4 cols `LKBB JAVASOMA The Impression` 14px gold + `Platform digital resmi...` 12px white/60 + logos 40px — **layout OK**, tetapi hierarchy `label-ceremonial 10.88px tracking 0.16 muted #9AA0A9` (`NAVIGASI`, `INFORMASI`, `KONTAK`) terlalu kecil muted → links `Beranda/Tim/Kompetisi/Timeline` 14px drowned.

---

## Podium / Competition Design

### Skor: 5.0/10 — most polarizing, hidden di production Aktif

**Konsep di code (Podium.tsx):** Shield `clipPath polygon(13px 0 … 100% 13px)` 13px chamfer → inner `bg-gradient-to-b #111318→#0A0C10` + gold/silver/bronze gradient border `p-[1.5px]` → glow layer, aura radial behind juara1, crown SVG 54px gold gradient + glow blur, laurel SVG left/right, medal circle gradient 32-44px + pulse, JUARA bar pill clip 9px, foot block `w-[90%] h-[10-16px] bg-[#0F1115] border-x border-b shadow`.

**Yang berhasil (engineering):**
- Proporsi juara 1 vs 2/3: height `[236→404px] vs [192→348px] vs [184→336px]` → juara 1 +40-56px taller, `z-20 vs z-10` correct — hierarchy via height (code).
- Shield clip distinctive: polygon chamfer 13px → **unik, not just rounded** — ceremonial “shield” feel, beda dari card generik. GOOD.
- `max-w-[560px] mx-auto grid grid-cols-3 items-end gap-1 xs:gap-1.5` centered → tested di 360 tidak clipped (gap 4px fits 3 shields 118px each).
- `results.json: hasPodium=false` di 96 captures → podium memang **hidden correct** untuk Aktif — tidak ada layout shift.

**Yang gagal (craft & motion — penyebab 5.0, merujuk code karena tidak visible live):**
1. **Crown clip-art.** SVG crown `M10 23 L16 9 L28 18…` + white circles + red dot + base rectangles — **emoji crown asset**, bukan heraldic. `crownBounce 2.8s infinite` + `crownGlow 2.2s` → gamified trophy, not ceremonial insignia.
2. **Laurel overdrawn.** Path `M32 10 C 28 12…` stroke 1.6 + sway `0.6deg infinite` ×2 kiri-kanan + medal 32px → 4 dekor competing di 160px shield.
3. **Medal gradient pastiche.** Silver `#F8FAFC→#64748B` bronze `#FDBA74→#7C2D12` skeuomorphic gradient di flat site — material inconsistent + `medalPulse scale 1.05 infinite` + inner sweep → overloaded.
4. **Animations destroy ceremony.** 8 keyframes + hover lifts `-translate-y-1.5 scale-[1.01]` + shimmer 1200ms → **festival game reward**, not still monument. All `infinite`.
5. **JUARA bar clip polygon 9px** — `h-[26px] text 9px tracking 0.14em JUARA 1` **sempit letterspacing berlebihan** → cekik di 360.
6. **Foot fake.** `w-[90%] h-[10-16px] bg-[#0F1115] shadow-[0_8px_18px]` → too small to read as plinth, looks thick border bottom, **floating shields**.
7. **Background not ceremonial:** `bg-[#09090b] border-y border-white/[0.05] py-10 + radial 860 0.07 + grid 56 0.018 + wave 0.08` → too subtle, section feels same dark as surrounding.

**Rekomendasi filosofi:** `2D clean ceremonial strong composition` — matikan semua infinite, crown flat single-color line-art (star/grade Paskibra), laurel hapus atau 1px outline, border solid 1px gold/silver/bronze (no gradient), foot 24px solid, background altar slightly lighter #0F1115, entrance stagger keep then still.

---

## Team Cards

### Skor: 5.5/10 (rusak oleh foto blank di desktop)

**PeletonCard (Beranda):** `src/components/peleton/PeletonCard.tsx:47-88`
- **Structure:** Photo 4/3 → gradient bottom 60% black → number pill top-left `bg-black/70` white 10px, fav heart top-right 28px `backdrop-blur`, category chip bottom-right `bg-white/90` 10px, text block `#07 10px gold + name 13-15px white + school 11px muted/60 + logo 36-48px flex` → CTA `DUKUNG` full-width gold pill 30-36px → `Share` + `QR` 2-col grid outline 32px.
- **Pros (ketika foto load):** Di `768x1024__root.png` card `#07 SMPN2 NGANJUK` foto parade lengkap uniform, gradient ensures legibility, name balance OK — **readable**.
- **Cons:**
  - Photo 4/3 **dominates** — di `1280x720__root.png` photo void hitam 60% vs info 40% → identity peleton (logo & number & school) kalah dari foto (yang malah kosong) → **product listing feel**, bukan peleton entry.
  - **Foto blank bug** — 6 cards 1280 void → user tidak tahu ini tim apa beyond text kecil 13px. Di `390x844__root.png` 5 dari 6 void → **first impression buruk**.
  - **Fav heart 28px** over photo — top-right vs number/category 3 pills clustering corners → busy. Di `390x844` heart 28px `<44` fail.
  - **CTA DUKUNG gold solid per card lebih kuat dari name** (CTA gold vs name white) → hierarchy: CTA > photo > name → **salah**. Dukungan should be **secondary ghost** until user memilih peleton — reduce “jualan”.
  - **Share + QR 2 buttons** under CTA — duplicate: `Share2` vs `QrCode` not self-explanatory, 12 small outline pill 32px di list 6 cards → busy.
  - **Category pill vs number pill** both `rounded-full` 10px — double pill same level.

**PeletonCardCompact (/tim row):**
- `flex items-center justify-between gap-2.5 rounded-[12px] border bg-card p-2.5` → pill `#01` gold 10px + name 13-15px truncate + logo 32-44px right. Di `1280x720__tim.png` 6 rows full-width clean — **best scan pattern di site — keep**. Di `390x844__tim.png` same but narrower, logo 32px right → **high scannability**.
- **Inconsistency** dengan home card: home vertical photo vs list horizontal — context shift tanpa penjelasan (why different?) — home order `01,02,03` by number, `/tim` also by number saat Aktif (so consistent currently by luck), tetapi saat voting closed akan sort by votes → order beda tanpa label → user confused. Detail `/tim/smpn-1-nganjuk-02` note “#02 — nomor resmi, bukan ranking” sudah ada di `Informasi Kompetisi` box — good, tetapi di list tidak ada Rank label.

---

## Navigation & Information Architecture

### Skor: 6.0/10

**Top nav (Navbar.tsx:13-18):** `Beranda / Tim / Kompetisi / Profile` + icons `Home/Users/Trophy/User` — **4 items ideal**, consistent dengan BottomNav 4 cols.

- **Desktop 1280 (`1280x720__root.png`):** nav centered `hidden lg:flex gap-1 rounded-full px-3.5 py-2 13px` active `bg-secondary` (Tim active grey pill) — **clean, understated, not competing with hero** — GOOD. Search icon `h-9 w-9 rounded-full border` hidden till `lg`? Actually at 1280 search icon top-right 36px black circle + speaker + Masuk — **three icons** — balanced.
- **Mobile 390 (`390x844__root.png` & `390x844__tim.png`):** **Two-tier header** 101.75px: row logo `LKBB` 13px + `JAVASOMA 10px gold` + search icon? Actually mobile header shows **second row search bar** `rounded-full border bg-background pl-9 pr-12 h-9` placeholder `Cari nama tim...` + submit black circle `h-7 w-7` 28px → **e-commerce search**, bukan “Cari tim”. Placeholder correct tetapi **persistent under nav** as second row → pushes hero down 46px → first paint hero below fold. `headerH 101.75` measured — **excessive**.
- **Search semantics:** bottom nav tidak ada Search; header search bar submits to `/search?q=` — tetapi `/search` page `PENCARIAN` empty state (`1280x720__search.png` 115KB, `390x844__search.png` 87KB) — **not linked from /tim** (user di /tim harus scroll up ke header search). Desktop search icon 36px vs mobile bar — **two patterns** should unify.
- **Profile access:** Desktop `currentUser ? avatar 28px + dropdown 240px rounded-2xl shadow-xl` vs guest `Masuk` pill — GOOD. Mobile: profile inside **BottomNav `Profil` tab** + **Sheet drawer 88vw** via `Menu` hamburger 32px. BottomNav also has `Profil` — **two entry points** OK untuk thumb, tetapi Sheet drawer saat guest hanya show `Beranda/Tim/Kompetisi/Profile`? Atau `Login`? Di guest, hamburger → Sheet? Tidak ter-capture di `390x844__cara_dukung` (no menu open). Code suggests mobile menu is **profile-only** when authed, **not site nav** — site nav di BottomNav saja — jadi `Menu` hamburger **misleading** (expect site nav, get profile).
- **BottomNav:** `fixed inset-x-0 bottom-0 z-40 border-t bg-background/92 backdrop-blur-xl grid-cols-4 9-10px label, 18px icon, active gold` — di `390x844__root.png` 4 tabs `Beranda / Tim / Kompetisi / Profil` dengan icon outline, active `Tim` gold di `/tim` (`390x844__tim.png` active gold) — **standard, thumb-friendly**, `pb-safe` handled, **GOOD**.
- **Footer:** Navigasi `Beranda/Tim/Kompetisi/Timeline` + Informasi `Peraturan/Jadwal/Dewan Juri/Pengumuman/Kompetisi` + Kontak `info@lkbb-event.id` — duplicate `Kompetisi` in both columns → confused. Timeline linked (correct), tetapi `Klasemen` redirect tidak di footer — fine.
- **Missing breadcrumb:** `/tim/smpn-1-nganjuk-02` detail (`390x844__tim_slug.png`) tidak ada breadcrumb `Beranda / Tim / SMPN 1 Nganjuk` — only header border — relies on browser back. Should have inline breadcrumb 11px muted.

---

## Interaction UX

### Skor: 5.5/10

**Tested interactions (Playwright click + evaluate):**

- **Hamburger → Sheet (code):** `w-[88vw] max-w-[320px]` slide from right, overlay dim, Esc to close — **functional** but close via overlay small, no explicit 44px X visible in sheet (if captured, `390x844__cara_dukung_modal.png` failed to show modal — indicates timing bug). Touch close area <44.
- **Cara Dukung (`CARA DUKUNG` outline pill 42px di hero):** click → Radix Dialog `sm:max-w-[520px]` centered, backdrop dark/50, Esc to close. Di test `390x844__cara_dukung_modal.png` 71KB shows **no modal after click** (just homepage with header) — **feedback not visible** — suggests dialog animation 0.7s or portal not captured via `fullPage:false` screenshot timing — interaction feedback **subtle**.
- **Dukungan preset qty (`390x844__dukungan.png`):** Grid 2×2 cards `rounded-xl border-2 p-2.5` active `border-primary bg-primary text-primary-foreground` (POPULER 150k gold) vs inactive `border-white/[0.06] bg-card hover:border-primary/30` — contrast jelas when selected. POPULER label `-top-1.5 right-2` black pill 10px — correct. Tap toggles qty state → **no confirmation** required — GOOD friction low. Tetapi **no animation beyond border color** — abrupt.
- **Qty +/- (`390x844__dukungan.png`):** `h-10 w-10 rounded-full border bg-card` minus plus 40px, input `type=number min1 max10000 rounded-full bg-muted h-10 font-black tabular 50` measured `qTY input 40px? Actually btn 40, input 40` — **still <44** but close. Decrement clamped 1, increment max 10000, `onChange parseInt clamp` — handles empty →1 but no inline error if >10000 → silently clamped. No haptic.
- **Fav heart on PeletonCard (`390x844__root.png` heart 28px top-right):** `onClick preventDefault stopPropagation handleFav → toast success` — optimistic via `useApp.favorites` — **feedback toast visible if provider** — but button 28px `<44` + absolute over photo → **easy mis-tap vs card link** (card whole link to `/tim/[slug]` surrounds photo+text, heart nested button with stopPropagation — fragile — if JS fails, heart inside link invalid).
- **Share Sheet (PeletonCard):** `navigator.share` native if available → fallback custom sheet with QR. Logic present, not captured in screenshot, but `Share2` & `QrCode` 32px outline buttons — if `navigator.share` exists on mobile → native sheet (good), desktop fallback QR — OK.
- **Search submit (`390x844__root.png` header search `Cari nama tim...` + black submit 28px):** `handleSearchSubmit → router.push(/search?q=) + setMobileSearch("")` — no debounce, no validation beyond trim — OK, but 28px submit `<44` → mis-tap.
- **Login form (`390x844__login.png` 87KB, `1280x720__login.png` 141KB):** `Input username password + Eye toggle h-7 w-7 28px <44 + error red p2.5 + MASUK pill h-11 + Isi Admin/Demo outline` — Eye 28px fail, but primary MASUK 44px good. `Masuk ke Akun` centered card 420px rounded 20 — calm.
- **Dukungan Lanjutkan ke Pembayaran (`390x844__dukungan.png` pill gold `Lanjutkan ke Pembayaran →`):** full-width 44px height good, sticky? Actually below `Total Rp150.000` card — at 390 below `Pengguna` footer? Screenshot show below total, above footer — not sticky on mobile (sticky desktop `lg:sticky lg:top-[76px]` ringkasan). Interaction: click → `/checkout`? Not tested, but `Server akan menghitung harga...` text 11px white/50 below — correct disclaimer.

**States lacking:**
- `Button disabled:loading` text `Memproses…` + `disabled:opacity-50` but **no spinner**.
- Error states: `error && rounded-xl bg-red-500/10 p-2.5 text-xs red-600` visible for dukungan closed — not triggered now (Aktif). 
- Focus: `globals :focus-visible outline 2px solid var(--ring) offset2 border-radius4` + button `focus-visible:border-ring ring-3` → double ring — visible on keyboard tab (input focus `focus:ring-2 focus:ring-[#C9A86A]` good). Pill `rounded-full` with focus outline square `radius 4px` → **rectangular halo on circular** → awkward.
- Loading: homepage `Memuat peleton...` plain text, no skeleton grid — perceived slower than skeleton `skeleton { linear 200% shimmer 1.6s infinite }` not used.
- Scroll feedback: header `hidden ? -translate-y-full` on scroll >5px → **hides nav while reading** — not expected.

---

## Responsive Audit

### Skor: 7.5/10 — tidak jebol, tetapi tidak diredesign — “adaptive resizing” bukan “responsive design”

**Engineering evidence:** `documentElement.scrollWidth === innerWidth` at 360 (360), 390 (390), 412 (412), 768 (768), 1280 (1280), 1366 (1366), 1440 (1440), 1920 (1920) → **no horizontal overflow** di 96 captures — achieved via `html overflow-x:hidden max-width:100vw`, `img max-width:100%`, `container px-3/4/6`, dialog `max-width:92vw`. **Very good hardening** (globals.css:158-166, 304-342). Sheet `w-[88vw] max-w-[320px]` clamped 92vw etc. → no jebol.

**Visual hierarchy per breakpoint (dari screenshot):**

| Area | 360×800 (12.5px root) | 390×844 (13.5px) | 768×1024 | 1280×720 (16px) | 1920×1080 |
|---|---|---|---|---|---|
| Hero H1 `PELETON` | 32px (px-1 clamp) — screenshot `360x800__root.png` 32px centered | 36px — `390x844__root.png` 36px | 42-56px — `768x1024__root.png` 42px | 68px — `1280x720__root.png` 68px gold glow | 76px — `1920x1080__root.png` 76px |
| Hero subtitle | 11px LKBB | 11px | 13px | 13px | 13px |
| Countdown | 22px numbers, py2 gap1 | 26px gap1 | 28px gap1.5 | 32px gap3 | 32px |
| Featured H2 | 22px — `390x844` 22px | 22px | 26px | 30px | 30px |
| PeletonCard grid | 2 col (xs 360→2col) — `360x800` 2 col | 2 col — `390` 2 col visible | 2 col (6 tim =3 rows) — `768` 2 col | 3 col — `1280` 3 col | 3 col |
| PeletonCard photo | blank 180px (bug) | blank (1 load) | 5 load | blank 6 cards | blank |
| BottomNav | 52px 9px label — `390` 53px | 53px 10px | hidden (md) | hidden | hidden |
| Kompetisi poster | Stack below Format — `390` long | stack | 2-col main? `768` maybe 1-col? Not captured 768 kompetisi but 1280 is 2-col |

**Issues produksi nyata:**

- **Photo load bug membesar dengan viewport:** `768x1024__root.png` foto load 5/6 — `1280x720__root.png` 0/6 blank, `1920x1080__root.png` 0/6, `390x844__root.png` 1/6 — **pattern: desktop 1280+ semua gagal**, tablet 768 sebagian sukses, mobile 390 sebagian. Suggest **image CDN rate-limit per IP vs lazy threshold** atau `src` `ghunqf...supabase` vs `blogger` difference. Should cap `max-h-260` atau switch `aspect-[16/10]` at desktop — tetapi bug utama adalah **image src invalid**, bukan aspect.
- **Tablet 768 orphan:** Featured 6 cards di `768x1024__root.png` → SMP 3 tim = 2+1 orphan left (`#08` MTSN alone left), SMA 3 tim = 2+1 orphan left (`#04` alone left 400px) — **asymmetry** — better center last orphan or make 3-col at md.
- **Navbar collision 390-640:** `hidden lg:flex` desktop nav hidden until 1024, tetapi header search bar 46px persists → hero cramped. At `768x1024` still mobile header 105.25px tall — **too tall for tablet**.
- **Sticky dukungan summary:** `lg:sticky lg:top-[76px]` — header 60px desktop → top 76 ~ header 60+16 gap correct, tetapi at mobile `390x844__dukungan.png` summary not sticky (correct), but **bottomNav 52px covers last 20px** of sticky? Not visible — content `pb-[72px]` gives 72px padding, but bottomNav `pb-safe` 12px — at `390x844__dukungan.png` `Lanjutkan ke Pembayaran` pill near bottom but above footer — **still visible fully**, so padding sufficient — but at `768` no bottomNav so sticky works.
- **Modal at 360:** `sm:max-w-[520px] max-width 92vw` ensures not overflow → GOOD (code), but capture failed to show — need re-test with `waitForSelector('[role="dialog"]')`.

**What missing is not breakage but intentional mobile design:** mobile hierarchy is just **shrunk desktop**, not **recomposed** (e.g., hero could stack tagline left, not center; photo could be horizontal split left 44% photo 1/1, right 56% text → reduces 300px tall to 140px scan faster — di `390x844__root.png` card tinggi ~ 280px vs `768` ~320px).

---

## Accessibility

### Skor: 5.0/10

| Criterion | Finding | Severity |
|---|---|---|
| **Color contrast — gold CTA** | `bg-primary #C9A86A` pill text `#0C0A06` → ratio ~9:1 PASS AA — `LIHAT PESERTA` di `1280x720__root.png` gold readable | 🟢 GOOD |
| **Muted text** | `text-muted-foreground #9AA0A9` on `bg-card #111318` (rgb 154 on 17) → ~4.3:1 fail AA small 11px (`SMP Negeri 1 Nganjuk` di `768x1024__root.png` pudar) | 🟠 HIGH |
| `text-white/50` 10-11px | white 50% over #09090b → approx #808080 on #09090b → 5:1 maybe pass but 9px `3 tim` pill `text-white/50` tracking 0.14 at 9px — **thin** | 🟡 MEDIUM |
| `text-[#C9A86A]` 10px eyebrow on #09090b | gold #C9A86A on near-black → 7:1 PASS — `LKBB • JAVASOMA THE IMPRESSION` 10px di hero | 🟢 |
| **Touch target** | **Systemic <44px fail**: hamburger 32px (`390x844__tim.png` menu), search submit 28px (`390x844__root.png` black circle), fav heart 28px (card), qty +/- 40px (`390x844__dukungan.png` minus 40), eye toggle 28px (`390x844__login.png`), share icons 32px | 🔴 CRITICAL |
| Focus visible | `:focus-visible outline 2px solid var(--ring) offset2 radius4` + button `focus-visible:border-ring ring-3` → double ring, pill `rounded-full` halo square → awkward | 🟡 |
| Keyboard nav | Header dropdown `aria-haspopup menu aria-expanded`, sheet trap focus Esc → works (code). BottomNav links **no `aria-current="page"`** only visual `text-foreground` gold — screen reader tidak tahu active | 🟡 |
| Alt text | Hero `alt=""` decorative correct, Peleton photo `alt={name}` present, card logo `alt="logo"` generic (should `alt={name} logo`), hero logo `aria-hidden true` correct | 🟡 |
| Reduced motion | `prefers-reduced-motion: reduce { animation-duration 0.01ms }` di globals 386-393 + Podium repeated → **GOOD** — respects OS | 🟢 |
| Semantic | H1 count: Homepage 1 (`PELETON TERFAVORIT`), `/tim` 1 (`DAFTAR TIM`), `/kompetisi` 1 (`LKBB JAVASOMA`) — hierarchy not skipping | 🟢 |
| Form labels | Login `label Nama` + `Input` **no htmlFor/id** → screen reader not linked — `390x844__login.png` label “Nama” vs input placeholder “Masukkan nama” tidak programmatic. Dukungan `label-ceremonial Atur Jumlah` + input number no htmlFor | 🟠 HIGH |
| Page title | `LKBB JAVASOMA — Peleton Terfavorit 2026` consistent via results.json `title` same all routes — meaningful but **duplicate** (should be per-route: `DAFTAR TIM — LKBB`) | 🟡 |
| Overall | Readable, tetapi muted greys 9-10px uppercase pill 60% opacity **hard for low vision**; density high at 360 (CTA 42 + qty 40 + presets 88) |  |

**Recommendation direction:** increase all icon-only to **44px hit area (padding trick, visual 20-24px icon stay)**, link `label htmlFor/id`, raise `muted-foreground` to `#A6ACB6` or weight 500 at 12px+, add `aria-current="page"` to BottomNav.

---

## Motion

### Skor: 4.0/10 — worst category (code-based, podium hidden live but motion remains in bundle)

**Inventory dari code `Podium.tsx:302-315`, `globals.css`, `Hero.tsx`:**

| Source | Animation | Duration | Infinite | Purpose | Screenshot |
|---|---|---|---|---|---|
| Hero H1 | `fadeIn 0.7s ease-out` once | 0.7s | no | OK subtle — `390x844__root.png` hero fade not visible but not distracting | 🟢 |
| Shield | `shieldEnter 0.72s cubic-bezier(0.16,1,0.3,1) both + delay 120/260/400ms` once | 0.72s | no | GOOD stagger — would look good if podium visible | 🟢 |
| Podium juara1 | `floatY 3.6s ease-in-out infinite` | loop | YES | **gratuitous** — float monument? No | 🔴 |
| Crown | `crownBounce 2.8s infinite` + `crownGlow 2.2s infinite` drop-shadow 6px | loop | YES | **double bad** — bounce gamified | 🔴 |
| Logo Float | `logoFloat 3.8s infinite` juara1 only | loop | YES | extra float | 🔴 |
| Medal | `medalPulse 2.4s infinite scale1.05 + shadow pulse` | loop | YES | pulsing badge = game | 🔴 |
| Laurel | `laurelSway 3.2s infinite rotate -0.6→0.6deg` ×2 | loop | YES | sway | 🔴 |
| Aura | `radial-gradient 0.07 opacity-70 group-hover 100` | hover | — | OK subtle | 🟢 |
| Shimmer | `via-white/[0.09] skew -12 translate-x[-140→140] 1200ms hover` | hover | hover | **shimmer sweep e-commerce flash** | 🟡 |
| Card hover | `-translate-y-1.5 scale-[1.01] shadows + border gold/25` | hover | hover | Generic SaaS lift — at `1280x720__root.png` hover not captured but code lift | 🟡 |
| Header hide | `transition-transform 300ms will-change-transform -translate-y-full` on scroll >5px | scroll | — | Distracting — hides nav while reading kompetisi long page | 🟡 |

**Critique:** `Podium.tsx` defines **8 keyframes** + hover lifts — applied **concurrently** if podium rendered (saat VOTING_CLOSED/PUBLISHED, 3 shields bouncing/pulsing/swaying/glowing simultaneously → **no rest state**). Ceremonial podium harus **still, dignified, like monument** — motion budget **entrance only**, not celebration loop. Current feels **mobile game reward screen**. Even when hidden today, **bundle still ships** 6 infinite animations — performance perception waste.

**Measured:** `will-change-transform` on header + shields, `backdrop-blur-[14px]` on sticky header → paint cost on scroll, but 96 captures no jank visible. `prefers-reduced-motion: reduce` globally disables all → respects OS setting — hero fadeIn 0.7s remains subtle.

---

## AI-Slop Detection

### Skor: included in Concept 5.0 — patterns from 96 screenshots + code

| Pattern | Present? | Evidence (viewport/file:line) |
|---|---|---|
| glassmorphism everywhere | **Partial — restrained GOOD** | Header `bg-background/72 backdrop-blur-[14px]` + countdown `bg-[#0B0C0F]/80 backdrop-blur` — only 2 places, not everywhere |
| rounded everything | **YES** | `rounded-[14-20px] rounded-full pill` semua: card 14px, badge pill, button pill, input pill, podium shield 16px chamfer, footer 20px, nav pill, search pill — **no square/cross except podium chamfer** → uniform soft — `1280x720__root.png` semua cards rounded 16, buttons pill |
| gradient everywhere | **YES** | `gold-gradient-text` 3 heroes, `hairline-gold`, `borderGrad from-[#C9A86A]`, `bg-gradient-to-r via-white/14` footer/header, button hover `from-[#C9A86A] to [#8C6A2A]` — **gradient is default filler** |
| random glow | **YES** | `radial-gradient 860×420 at 18% -10% 0.08` in hero, `bg-[radial-gradient(...0.07)]` in Featured/Kompetisi/Footer — same radial copied 6 times → fake depth |
| excessive blur | **NO** | Only header 14px + countdown blur — restrained |
| generic hero | **YES** | Unsplash `photo-159559` soldier generic + centered small caps `LKBB • JAVASOMA` + pill CTA pair `LIHAT PESERTA / CARA DUKUNG` + countdown 4 boxes → **template hero archetype** (startup launch countdown) — `1280x720__root.png` & `390x844__root.png` identical structure |
| generic dashboard card | **YES** | `rounded-[16px] border border-border bg-card p-5` repeated **14 times** across `1280x720__kompetisi.png` 3 top cards + Tentang + Juri + Persyaratan + Format → **dashboard card clone** |
| excessive shadows | **NO** | Shadows subtle `shadow-soft 0 4px 16px /0.06` — not excessive — `768x1024__root.png` card shadow barely visible |
| giant typography w/o reason | **Partial** | Hero 76px clamp giant justified competition title; but Featured 30px also giant → inflation — `1280x720__root.png` Featured H2 30px gold vs hero 68px |
| icon decoration | **YES** | `Lucide Home/Users/Trophy/User` nav + `Calendar/Users/Award` info cards `1280x720__kompetisi.png` top 3 icons generic — tidak ada Paskibra iconography (garuda/borgol) |
| floating blobs | **YES** | `wave SVG 0.08`, `radial aura` behind juara1 (code), `noise-premium SVG` — декоратив blobs without meaning |
| unnecessary 3D | **NO** | Podium 2D flat — GOOD choice, avoids trap |
| excessive pill buttons | **YES** | Every CTA/badge/filter/category/number is pill `rounded-full` — **pillification** — `390x844__root.png` 5 pills per card (number + heart + category + DUKUNG + share + QR =6) |
| cards inside cards inside cards | **YES** | `Featured section bg-[#09090b] border-y` → SMP category pill `bg-white` → `PeletonCard bg-card border` → inside `profileUrl link + image overlay + 2 pill buttons` → **3 layers** — `768x1024__root.png` |
| meaningless statistics | **NO** | Countdown meaningful (tapi stuck 00), stats not faked |
| fake visual complexity | **YES** | `hairline + hairline-gold + hairline-thin + gold-hairline-premium + noise-premium + wave 2 paths` → **4 hairline variants** adding noise without hierarchy — `globals.css:200-280` |

**Overall slop verdict:** **Medium-high template fingerprint**. Not worst AI slop (no neon blobs or glass everywhere), but **clear shadcn+tailwind starter → gold recolor**. `globals.css` utilities (`gold-gradient-text`, `premium-card:hover`, `noise-premium`, `gold-hairline-premium`) look **added to de-template** but still applied thinly. Dampak: **feels premium-dark SaaS, not LKBB ceremony** — `1280x720__kompetisi.png` left dark cards vs right gold poster JPG — poster wins ceremonial, UI loses.

---

## Performance Perception

### Skor: 6.5/10 (visual only, no Lighthouse lab, 96 fullPage captures)

- **Layout shift:** **None detected** — fixed aspect `4/3` reserves image space (meskipun blank), header 61/101 fixed height, countdown grid 4 fixed numbers → no CLS on load — di 96 captures semua load tanpa shift (screenshot diff first paint vs fullPage identical). GOOD hardening.
- **Image loading:** Peleton photos remote Supabase storage `ghunqf...` + blogger `googleusercontent` — **external no-optimize** (`next.config images.remotePatterns` maybe missing for supabase) → di `1280x720__root.png` foto tidak load, placeholder hitam void 180px → network slow → blank square then pop? Di `768x1024__root.png` load success suggests **caching or viewport eager threshold**, not size. No `next/image` used — `<img>` raw — **no priority/LCP** for hero background 1600w Unsplash 70q — hero LCP is H1 text over image opacity 0.32 — image load not blocking text → perceived fast, tetapi peleton batch 6 images above-fold 768 should be eager.
- **Hero media LCP:** `ghunqf.../branding/...png` + `photo-1595590424283?w=1600&q=70` both above fold, hero LCP is H1 text with opacity 0.32 — image load not blocking text → perceived fast di `768` (text renders first), tetapi di `1280x720__root.png` hero text tetap render meskipun peleton blank — OK.
- **Skeleton:** `skeleton { linear 200% shimmer 1.6s infinite }` defined but **not used visibly** — loading states are `p-8 text-center Memuat peleton...` plain → di `results.json` all routes 200 within 1200ms TTFB ~ 725-1137ms (local log `GET / 200 1863ms (next 1137ms app-code 725ms)`) → perceived slower than skeleton grid.
- **Animation jank:** `backdrop-blur-[14px]` header + `floatY 3.6s` concurrent with `crownBounce` (when podium visible) → GPU layers, tetapi saat ini podium hidden — no jank di `390x844__root.png` scroll. At `1920x1080__root.png` 6 cards no anim.
- **Excessive effects on first paint:** Hero 2 absolute gradients + image + potential logo watermark (hidden default `showLogo false`) → 3 layers composite — not heavy.
- **Delayed content & countdown bug:** Home `isActive fetch peletons order number` blocking server component → TTFB local 725ms + next 1137ms = 1863ms — **slow for local**, production cold start similar. No `loading.tsx`. Plus countdown stuck 00 → **perceived broken**, not slow.
- **Overall visual/perceived performance acceptable, not premium** — no flash, no FOUC (dark class pre-script `__html` inline adds `dark` instantly), tetapi **image fail + countdown fail** hurt perceived quality more than raw speed.

---

## User Flow Audit

Simulasi visitor baru 2026-09-11 production `Aktif — Dukungan Dibuka`:

### Flow 1: Memahami event (new visitor → “LKBB apa?”)
**Entry:** `/` Hero eyebrow `LKBB • JAVASOMA THE IMPRESSION` 10px gold (`390x844__root.png` top 3 lines) → H1 `PELETON TERFAVORIT` 36px gold-gradient → subtitle `LKBB` 11px `JAVASOMA THE IMPRESSION` 10px `ASTRA DHARMA...` 10px → CTA pair `LIHAT PESERTA / CARA DUKUNG` → countdown `EVENT DIMULAI DALAM 00 00 00 00` 9px + big numbers. **Problem:** new visitor **harus infer** event dari small caps; hero tidak spell `Lomba Keterampilan Baris-Berbaris` explicitly di visible hero (only tagline). Must scroll ke `Featured` atau `Kompetisi` untuk baca panjang `Tentang Kompetisi` di `1280x720__kompetisi.png` (baru ada definisi `ajar kompetisi ketangkasan baris-berbaris tingkat SMP/MTs...`). **Friction: Medium**. CTA `LIHAT PESERTA` pushes ke `/tim` prematurely (user belum paham event). Countdown 00 contradicts `TIMELINE` (`1280x720__timeline.png` stage 4 `Voting Dibuka 1 Sep 2026` gold active) — user bingung “mulai atau sudah?”.

### Flow 2: Melihat peserta (browse)
**Path:** Beranda `Featured` (`768x1024__root.png` 2-col 6 cards) vs `/tim` (`1280x720__tim.png` 6 rows full-width order number) — saat Aktif, row order ` #07 SMPN2, #08 MTSN2, #02 SMPN1 / #01 SMKN1, #03 SMAN1, #04 SMKN2` **urut nomor tidak ranking** (correct untuk Aktif). Tetapi di `390x844__root.png` Featured order ` #02, #07, #08 / #01, #03, #04` tampil `Beranda urut nomor tampil (01,02,03…)` note 12px white/60 → **consistent**. **Friction low untuk browse**, tetapi **foto blank di 1280** membuat browse tidak visual — user tidak bisa bedakan tim via foto parade (hanya logo 32px). Di `768x1024__root.png` foto ada, browse visual good — inconsistency hurt.

### Flow 3: Mencari tim
**Entry:** Top bar search `input h-9 rounded-full pl-9 pr-12` placeholder `Cari nama tim...` (`390x844__root.png` persistent second row 36px + submit black circle 28px) → submit to `/search?q=` → `1280x720__search.png` empty `PENCARIAN` page. Search not integrated with suggestion/autocomplete → must type exact `SMPN 1 Nganjuk`. `/tim` page itself **tidak ada inline filter chip by category + input** — user harus tahu top bar. **Friction: Medium-high** untuk 6 tim sekarang (masih OK), tetapi untuk 40 peletons akan high.

### Flow 4: Memilih tim → dukungan/voting
**Two paths:**
- **Card CTA `DUKUNG` gold pill 30-36px on PeletonCard home** (`768x1024__root.png` `DUKUNG` gold full-width) → `href /dukungan?peleton=slug` → goes to `390x844__dukungan.png` with that peleton prefilled `SMKN1 KERTOSONO SMA 01` — **1 tap** — GOOD.
- **Card link** clicking photo/name → `/tim/smpn-1-nganjuk-02` (`390x844__tim_slug.png`) → detail photo void 4/3 → `SMP` badge + `TERVERIFIKASI` emerald + `SMPN 1 NGANJUK` + tagline `Kekuatan muda presisi memukau...` + `DUKUNG PELETON INI` pill 46px gold → then to dukungan → **2 taps**. Detail page show same info plus `Informasi Kompetisi: Nomor Peserta #02 — nomor resmi, bukan ranking` box — useful verification but extra step.

**Current Aktif:** dukungan page `390x844__dukungan.png` show **presets enabled** `10 Suara Rp30.000 / 50 POPULER Rp150.000 gold / 100 Rp300.000 / 300 Rp900.000` + `Atur Jumlah ± 50` + `Total Rp150.000` + `Lanjutkan ke Pembayaran →` gold pill — **friction low**, no disabled state (beda dengan VOTING_CLOSED red banner). GOOD.

### Flow 5: Memahami status voting
State machine `NOT_STARTED → Aktif (VOTING_OPEN) → VOTING_CLOSED → RESULT_PUBLISHED`. Badges:
- `/tim` header `Aktif — Dukungan Dibuka` emerald pill (`1280x720__tim.png` teal) — **clear**.
- `/timeline` `Status Saat Ini VOTING BERLANGSUNG` emerald pill + `Voting 1 Sep – 24 Okt 2026` (`1280x720__timeline.png` below 8 stages) — **clear**.
- Homepage **no status banner** saat Aktif (only at VOTING_CLOSED red) — user di home tidak tahu status tanpa scroll ke `/tim` or poster — **gap**.
- **But:** homepage note `Featured p.mt-3 13px white/60` `Beranda urut nomor tampil (01,02,03…) — SMP & SMA terpisah. Peringkat disembunyikan saat voting aktif.` — correct active behavior — **good disclosure**. At `768x1024__root.png` note visible.

### Flow 6: Melihat hasil ketika tersedia
Only at `RESULT_PUBLISHED` podium appears (code 2-col SMA/SMP). Saat `Aktif`, `/tim/smpn-1-nganjuk-02` show `Klasemen disembunyikan — Ballot disembunyikan selama voting aktif.` yellow box + `STATUS KOMPETISI Aktif` (`390x844__tim_slug.png` bottom) → **accurate** — ranking hidden. But user cannot preview podium — expected.

### Flow 7: Membuka profile / guest
`/profile` guest (`390x844` maybe `76495` bytes) centered card `Belum Masuk` → `Masuk/Daftar` pills — **clear**. But navigation: `BottomNav Profil` vs `Header Masuk` pill → **two entry points** but sheet confusion (hamburger expected nav, get profile).

### Flow 8: Membagikan profile/support link
PeletonCard `Share2` + `QrCode` icons 32px outline below `DUKUNG` — di `768x1024__root.png` each card bottom has `share + QR` 2 outline pills grey — tap → `navigator.share` native if exists else custom sheet QR. **Friction low on mobile native**, medium desktop (need QR fallback explain). Di `390x844__root.png` same 2 icons per card — **icon-only no label** → requires aria-label reading.

**Overall friction:** **Medium** — Beranda → Tim → Detail → Dukungan ~3-4 taps, search weak, status messaging current **good for Aktif** (emerald), tetapi **countdown 00 + foto blank + double header** nambah cognitive load. No onboarding for `Cara Dukung` unless tap secondary CTA (modal not reliably captured).

---

## What Works Well (Keep)

🟢 **Zero overflow engineering (96/96 pass):** `max-width:100vw overflow-x:hidden`, `img max-width:100%`, `92vw` clamps, `grid gap premium` — **96 captures `hasOverflow=false`** — discipline langka — pertahankan, ini fondasi yang menyelamatkan hampir semua viewport. `File: src/app/globals.css:158-166, results.json`

🟢 **Container 1280 consistency:** `mx-auto max-w-[1280px] px-3/4/6` everywhere — `1280x720__kompetisi.png` 2-col poster alignment perfect, `1920x1080__root.png` centered not stretched — **predictable**. `File: src/app/page.tsx, tim/page.tsx`

🟢 **PeletonCardCompact row (tim list):** `pill # + name + logo` compact row (`1280x720__tim.png` 6 rows full-width 1232px, `390x844__tim.png` p2.5) — **best scan pattern di site** — keep, jadikan canonical untuk home juga opsi horizontal.

🟢 **Sticky summary pattern (dukungan desktop):** `lg:sticky lg:top-[76px]` ringkasan alongside presets (`1280x720__dukungan.png` sticky not hit bottomNav) — **good spatial decision**.

🟢 **Tabular numbers:** countdown `tabular-nums 26-32px` & price `Rp150.000 tabular` (`390x844__dukungan.png` Total 150.000) — **pro touch**.

🟢 **Auth card centered 420px rounded 20:** `1280x720__login.png` calm, not aggressive, `Masuk ke Akun` balanced.

🟢 **Top hairline gold 0.5px `via-[#C9A86A]/18`:** subtle brand signal not overbearing — `1280x720__root.png` header gold line 0.5px terlihat.

🟢 **Reduced-motion guard:** global `animation-duration 0.01ms` on prefers-reduced — respect — `globals.css:386-393`.

🟢 **Poster ceremonial as content:** `1280x720__kompetisi.png` poster gold ornate `LKBB JAVASOMA The Impression PASKIBRA SMKN 1 Kertosono` dengan TIMELINE + 3 juri foto + batik corner — **paling ceremonial di site** — pertahankan sebagai hero kompetis, tetapi **jangan jadi image JPG only** — translate ke UI.

🟢 **Timeline 8-stage horizontal desktop vs vertical mobile:** `1280x720__timeline.png` 8 cols + `390x844__timeline.png` vertical list — **responsive intentional**, not just shrink — best responsive exemple in app.

---

## What Must Change

| Area | Direction (no code) — visual decision, bukan CSS |
|---|---|
| **Hero hierarchy & countdown bug** | Fix countdown source ke `event_date` canonical, tampilkan `MENUJU PENUTUPAN 43 HARI` dinamis, jangan 00. Hero jadi satu lockup dominan: emblem tahun 2026 48px + H1 `PELETON TERFAVORIT` solid white 68px (gold hanya untuk rule kecil 24px di eyebrow), tagline satu baris `Astra Dharma Hayuning Budaya` 12px, CTA satu primary gold 44px + secondary ghost kecil, countdown secondary 50% size di bawah. |
| **Foto blank** | Jadikan 3 cards above-fold `loading="eager"` + `onError` fallback logo centered 80px dengan pattern `bg-[#0F1115]` bukan void hitam. Audit `next.config images.remotePatterns` untuk `supabase.co/storage` + `googleusercontent`, enable `next/image` dengan `sizes="(max-width 768) 50vw, 33vw"` dan priority untuk 2 first cards. |
| **Podium motion & semantics** | Matikan semua infinite (crown/medal/laurel/float) — keep `shieldEnter stagger` only, crown flat line-art star Paskibra-appropriate 24px, laurel hapus atau 1px outline, border solid 1px gold/silver/bronze no gradient, foot 24px solid plinth #0F1115, background altar lighter #0F1115 + double hairline. Buat `variant=provisional` vs `final` bukan hardcode `isPublished true`. |
| **Typography monovoice** | Introduce ceremonial display (condensed Inter tight -0.03 already tight, but size contrast lebih: H1 42→72, H2 18→24) + body Inter 500 14/22. Gold-gradient hanya untuk satu hero H1 — H2 lain solid white + small gold rule 24px. Kurangi uppercase 50% (school name jadi normal case 12px white/60). |
| **Color crimson activation** | Kurangi gold usage 30% (currently ~22% pixels), aktifkan crimson #A51D2D untuk status official `TERVERIFIKASI` badge dan header double line 2px crimson + 0.5px gold. Ganti `Aktif` emerald jadi `gold/14 + border gold/30 text gold`, ganti `VOTING_CLOSED` warning yellow ke `gold-muted`. |
| **Card ecommerce feel** | Home PeletonCard photo 4/3 → 16/10 atau 1/1 + max-h 220 cap di mobile, CTA `DUKUNG` jadi secondary outline `border-white/12` sampai hover/detail — name 15px bold white is primary CTA. Gabung `Share + QR` jadi single overflow `···` menu. Tame pill corners busy. |
| **Nav double header** | Mobile header dari 101px → 56px single row: logo `h-11` + search icon trigger (not persistent bar) expand overlay full-width, hamburger 44px. Sheet must contain site nav `Beranda/Tim/Kompetisi/Timeline` + profile, not only profile. Tambah breadcrumb `Beranda / Tim / SMPN 1 Nganjuk` 11px muted di detail. |
| **Motion budget** | Podium motion budget: enter only. Hapus shimmer sweep, floats, pulses. Header hide threshold 80px + hysteresis atau remove auto-hide keep sticky always (kompetisi long page 409k). |
| **A11y touch & label** | Bump semua icon-only 28-32px ke 44px hit area (padding trick visual 20px stay), link `label htmlFor/id` untuk login & dukungan input, raise `muted-foreground` #9AA0A9 → #A6ACB6 12px+, add `aria-current="page"` ke BottomNav active. |
| **Status messaging** | Single source of truth untuk status banner (not duplicate di hero + timeline + /tim badge) — buat sticky status bar 36px gold/10 border bawah header yang update text `VOTING BERLANGSUNG • 43 HARI MENUJU PENUTUPAN` — jangan 00. |
| **Search discoverability** | Expose inline filter `Cari peleton...` + chips `Semua / SMP / SMA` di `/tim` header (bukan hanya top bar), add empty-state that links to `/tim` dengan suggestion. |
| **Content** | Hero must spell `Lomba Keterampilan Baris-Berbaris` explicitly 12px white 60 di bawah tagline. Footer Paskibra block larger: logo 56px + `Penyelenggara PASKIBRA Satria Cengkara SMKN1 Kertosono` 13px white, bukan 40px muted drowned. Poster LKBB gold di kompetisi — translate ornate corner ke CSS border, bukan image only. |

---

## Priority Matrix

| Priority | Problem | Impact | Area | Recommended Direction |
|---|---|---|---|---|
| **P0** | Countdown stuck `00 HARI 00 JAM` di semua 8 viewport padahal 24 Okt future | Kredibilitas event hancur — user kira selesai/bug | Hero / State | Fix `useCountdown` source ke canonical event date, label dinamis `MENUJU PENUTUPAN 43 HARI`, jangan 00 — single source |
| **P0** | Foto peleton blank hitam 0/6 di 1280, 5/6 di 390 (hanya 768 load 5/6) | First impression broken — card void 60% | Team Card / Image | Eager first 3 + onError logo fallback + next/image + audit Supabase storage ACL + sizes |
| **P0** | Touch target <44px systemik (search submit 28, fav 28, hamburger 32, eye 28, share 32) di `390x844__root.png` & `390x844__tim.png` | A11y fail WCAG 2.5.5, mis-tap mobile | A11y / Components | Naikkan semua icon-only ke 44px hit area (padding), visual icon stay 20-24px |
| **P1** | Header mobile 101.75px double row memakan 25% viewport 390 — `results.json headerH 101.75` | Hero tertekan, first paint bawah lipat, chrome 154px/844 | Navigation | Single row 56px: logo + search icon overlay trigger, Sheet include site nav |
| **P1** | Podium motion carnival 6 infinite (code) — `crownBounce 2.8s`, `medalPulse 2.4s`, `laurelSway 3.2s`, `floatY 3.6s` — akan live saat VOTING_CLOSED/PUBLISHED | Bunuh nuansa ceremony, attention noise | Motion / Podium | Keep `shieldEnter` only, delete floats/pulses/leys; flat medal/crown |
| **P1** | Gold-gradient overused di 3 H2 + labels — `1280x720__root.png` hero 68px gold + Featured 30px gold + Kompetisi H1 gold | Hierarchy flat, decorative inflation | Typography / Color | Gold-gradient hanya untuk H1 hero; H2 lain solid white + 24px gold rule |
| **P1** | Uniform `rounded-16 border bg-card` di semua section → no ceremonial tier — `1280x720__kompetisi.png` 7 cards identik | Sections indistinguishable, poster JPG menang vs UI | Layout / Component | Introduce 1 altar surface lighter #0F1115 + double hairline for podium only |
| **P1** | Status `Aktif` emerald hijau mint vs `VOTING_CLOSED` yellow — `1280x720__tim.png` teal badge alien ke gold system | Tone e-commerce, bukan ceremony | Color | Ganti emerald/yellow ke `gold/14 + border gold/30` — konsisten gold-muted |
| **P2** | Photo 4/3 dominates blank void 180px — `1280x720__root.png` 6 voids hitam 60% height | Identity peleton kalah dari foto fail | Team Card | Cap photo 220px max mobile, 16/10 desktop, push logo/number weight up; fallback logo centered |
| **P2** | CTA `DUKUNG` gold solid per card lebih kuat dari name — `768x1024__root.png` 6 gold pills sama kuat | Fokus jualan vs identity | Team Card / Hierarchy | CTA jadi ghost outline until hover/detail; name 15px white is CTA |
| **P2** | Pill everywhere 5-6 per card → corners busy — `390x844__root.png` #02 card 3 pills corners | Visual clutter | Component | Gabung share/qr jadi single overflow `···`; reduce pills to number + category only |
| **P2** | Inter 800 semua heading — no ceremonial voice — `1280x720__kompetisi.png` H1 Inter black 700 friendly | Generic SaaS feel vs baris-berbaris discipline | Typography | Introduce condensed display for H1/H2 only (tight -0.03 keep but size contrast up) |
| **P2** | Header hide on 5px scroll → jarring — kompetisi long scroll `390x844__kompetisi.png` 409KB height | Reading interruption | Interaction | Threshold 80px + hysteresis atau remove auto-hide keep sticky |
| **P2** | `muted-foreground #9AA0A9` 11px fail AA on card — `768x1024__root.png` `SMP Negeri 1 Nganjuk` pudar | Readability low vision | A11y | Naikkan ke #A6ACB6 atau size 12px+ weight 500 |
| **P3** | Focus ring square on pill `rounded-full` — `390x844__dukungan.png` DUKUNG pill focus halo square | Polish fail | A11y | Focus ring `rounded-full` inherit — `outline-radius: 999px` |
| **P3** | Footer `label-ceremonial` 10.88px tracking 0.16 muted drowned — `1280x720__root.png` NAVIGASI 10px grey | Navigation hard to scan | Layout | Size 11→12px + color white/60 not #9AA0A9 muted |
| **P3** | `html font-size clamp 10.5-14px` mempengaruhi rem globally tetapi hampir semua `text-[11px]` fixed px → waste — `globals.css:304-341` | Inconsistent scaling | Typography / Responsive | Replace with container query or leave root 16, scale H1 via clamp only |
| **P3** | Search not surfaced on /tim — `1280x720__tim.png` no inline search | Discoverability | IA | Add inline filter/search chips on /tim header |
| **P3** | Poster sponsorship greyed via `enabled=false` but code tetap load large JPG 700KB gold — `1280x720__kompetisi.png` poster 697KB | Content governance | Content | If sponsor disabled, ensure admin preview toggle visible + compress JPG 550KB → 120KB webp |
| **P3** | Timeline stage 3-4 both gold active (`1280x720__timeline.png` 3 & 4 gold) — dual active ambiguous | State clarity | IA | Active should be single `4 Voting Dibuka` gold, 3 should be green check done |

---

## Recommended Design Direction

### Jika tim melanjutkan dari codebase sekarang (no full redesign) — principles to reach 8.5/10:

**Visual language: “Discipline & Ritual”, not “SaaS Launch”.**
Setiap keputusan: “apakah ini terasa seperti baris-berbaris di lapangan upacara?” — grid tegas, alignment presisi, repetition, silence > decoration. Kurangi dekor `radial/aura/wave/noise` 50% (`globals.css` gold-hairline-premium, noise-premium), tambahkan **struktur** (grid lines 0.5px subtle di podium altar 56px, bukan blur). Poster LKBB gold ornate di `1280x720__kompetisi.png` adalah reference — **translate corner ornament ke CSS border 2px double gold 1px** untuk altar, bukan image only.

**Altar & Pavilions:** Hanya podium yang mendapat treatment ceremonial `bg-[#0F1115]` lighter +8 dari `#09090b` + double hairline gold 0.5px + 2px crimson inner + still monument. Semua section lain **pavilion** — flat card dark `#111318` consistent, tidak bersaing — Featured, Kompetisi cards, Timeline dark cards tetap flat. Ini buat **one gold moment per viewport**.

**Typography direction:**
- **Dual voice:** `Display = condensed strong` (maybe `Space Grotesk` or `Inter tight -0.035` size contrast lebih besar: H1 42→72, H2 18→24, label 10px) + `Body = Inter 500 14/22` 60% white. Gold-gradient **hanya untuk satu hero H1** (`1280x720__root.png` H1 stay), semua H2 lain **putih solid** dengan **single gold rule 24px horizontal** di samping eyebrow `PESERTA` 10px. 
- **Uppercase cooldown:** hanya untuk **eyebrow kategori & podium rank `JUARA 1`** — tidak untuk semua card label. Card school name jadi normal case 12px/60% white → lebih manusia — `390x844__tim_slug.png` detail school `SMP Negeri 1 Nganjuk` normal case good, bawa ke card.

**Color direction:**
- **Charcoal hierarchy 4-step:** `page #09090b → altar #0F1115 (+8) → card #13161C (+4) → elevated #1B1F2B (+4)` — not 2-step now. Gold `#C9A86A` usage budget **≤15% pixels per viewport** (currently ~18-22% di `1280x720__root.png` hero + 6 DUKUNG gold pills). 
- **Crimson activation:** gunakan `#A51D2D` untuk **status official `TERVERIFIKASI` badge** (`390x844__tim_slug.png` currently emerald, should crimson) dan **one ceremonial accent bar** 2px crimson + 0.5px gold double line di header hero bottom — connect Paskibra merah, bukan emerald startup.

**Spacing philosophy:**
- **8px base, but sections breathe different.** Hero `py-14→20` tall (now `pt-8 pb-6` too short), Featured `py-14` consistent, Tim list `py-8` but `gap-3` rows. **Do not fight rhythm** with `mt-8` hand overrides — define `section-gap: 56px desktop / 32 mobile` token. Di `390x844__kompetisi.png` 7 cards stack need `gap-8` not `gap-3` to breathe.
- **Mobile density:** mobile is **not shrunk desktop** — reorganize: PeletonCard at <640 could be **horizontal split: left 44% photo 1/1 eager, right 56% text+logo** → reduces 280px tall void to 140px, scan faster, avoids blank 4/3 void — at `390x844__root.png` currently 2-col vertical 179px wide × 280px tall → horizontal would be better.

**Card philosophy:**
- **Peleton is uniform, not product.** Photo is **context**, not hero. Hierarchy: **Number pill 10px gold `#C9A86A` → Name 14px 900 white → School 12px 50% normal case → Logo 32px** → CTA **ghost** (`border border-white/12 bg-transparent`) naik jadi gold fill hanya on hover/detail. Mengurangi “jualan” di `768x1024__root.png` 6 gold `DUKUNG` pills competing.
- **Row vs Card unification:** Home photo card dan /tim row harus **share same mini-row component** — foto opsional 1/1 left, text right. Sudah ada row pattern good di `1280x720__tim.png` — extend ke home as option 2-col row bukan 4/3 void.

**Podium philosophy:**
- **Monument, not trophy.** Flat shield chamfer 13px stays, **1px solid stroke** (gold #C9A86A 1st, silver #CBD5E1 2nd, bronze #B45309 muted 3rd) — **no gradient border**. Medal flat numeral **white on gold-foil disk** (`bg-[#C9A86A] text-[#0C0A06]`) 36px, no pulse. Crown **single-color flat line** star above rank 16px, not crown 54px bounce. Laurel **hapus** (code laurelSway delete). Foot plinth **24px tall** solid `#0F1115` with `inset shadow 0 -8px`. No infinite; `shieldEnter` stagger 120/260/400ms keep, then **still**. Background altar `bg-[#0F1115]` lighter + `border-y border-white/[0.06]` + `hairline 0.5px gold/18` only.

**Motion philosophy:**
- **Ceremonial stillness:** 1 entrance 0.72s, then silence. Hover lifts **1px only** (not -1.5 scale), shimmer **hapus**. Header stays sticky always (no hide on 5px) — keep `will-change-transform` only for header, not shields. Countdown numbers change with `tabular-nums` **no bounce**, just `transition-opacity 200ms`.

**Mobile philosophy:**
- **Thumb first, ceremony second.** BottomNav 52px keep but **content last padding 24px above nav**, not 72 — `390x844__dukungan.png` `Lanjutkan` pill already above footer, padding sufficient, keep. Header single row 56px, search icon → overlay full-width `h-44px input` with `autofocus` + chips `SMP/SMA`. Forms `h-44px` min (`393x844` dukungan qty 40→44). Grid 2-col at 390 for peleton cards (currently correct 2-col) — ensure photo eager not void. `TIM` row list at 390 keep single col full-width scan good.

Target outcome: **user 3 detik di `390x844__root.png`:** `LKBB JAVASOMA — Lomba Baris Berbaris — Paskibra SMKN 1 Kertosono — PELETON TERFAVORIT` terbaca **urut vertical** dengan **satu gold moment** (H1 36px solid + 24px gold rule), countdown secondary `43 HARI MENUJU PENUTUPAN` 20px tabular muted, 2-col cards **dengan foto** 140px horizontal, **no void**.

---

## Final Verdict

**LKBB Voting today is a 6.1 — a very well engineered voting platform in a dark-gold suit, but the suit was bought off the rack and the shoes are untied.**

It will **survive production** — evidence: **96/96 no overflow**, `DAFTAR TIM` row scan works (`1280x720__tim.png` 6 rows clean), `Dukungan` preset grid & sticky total works (`390x844__dukungan.png` 150k POPULER gold), `Kompetisi` 2-col poster layout good (`1280x720__kompetisi.png`), `Timeline` 8-stage responsive correct (`1280x720__timeline.png` vs `390x844__timeline.png`), `Klasemen`→`/tim` redirect not broken, `Login` centered 420px calm, **no crash at 1920**. Payment guardrails `isClosed` checks in dukungan exist (code) — **engineering saves 70% effort**.

But it **won't win prestige** — the ceremonial tension LKBB needs (discipline, lineage Paskibra, Javasoma cultural tagline) is **flattened into generic SaaS cards and carnival podium code**, and **production adds self-inflicted wounds**: `00` countdown, photo voids at 1280, double header 101px, emerald status foreign to gold. User di `390x844` lihat hero 00 + 6 cards half blank → **trust drop** before they read `PASKIBRA SMKN 1 KERTOSONO` 40px footer drowned.

**The good news:** foundation (overflow-hardening, 1280 container, sticky summary, tabular-nums, reduced-motion, supabase RLS state guards, timeline 8-stage correct) **saves rewrite**. You don't need new system — you need **art direction restraint**:

1. **Fix the lies first** — countdown 00 → 43 hari, foto blank → eager+fallback.
2. **Kill the festival, keep the discipline** — motion gold infinite → still.
3. **Give podium an altar, not a stage — and give Paskibra its crimson.**

If team addresses **P0 only (countdown + foto + touch 44px) = 3 items**, score lifts to **~6.8** (usable). Adding **P1 (header single row, podium still, gold cooldown, tier altar, emerald→gold) = +5 items** reaches **~7.6** (professional). Adding **P2 (card photo cap, CTA ghost, pill cleanup, Inter pairing, header hysteresis) = +5** reaches **8.3** — flagship LKBB prestige tanpa rewrite layout. Current **“bagus untuk voting, belum agung untuk LKBB”** — `Foto: /tmp/lkbb-audit-screens/768x1024__root.png` adalah best-case (foto load), `1280x720__root.png` worst-case (blank) — produksi hari ini **di antara keduanya, lebih dekat ke blank** — audit closed, no code changed, ready for redesign handoff.

---

### Evidence & Screenshots — Playwright 1.62 / 2026-09-11

- **All captures 96:** `/tmp/lkbb-audit-screens/` — fullPage PNG, `results.json` (overflow=false 96/96)
  - Hero: `390x844__root.png` (278K, headerH 101.75, H1 PELETON TERFAVORIT 36px, countdown 00×4), `1280x720__root.png` (281K, headerH 61, hero 68px), `768x1024__root.png` (586K, 2-col photos 5/6 load), `1920x1080__root.png` (1006K, blank 0/6), `360x800__root.png` (293K)
  - Tim: `390x844__tim.png` (129K, DAFTAR TIM emerald badge), `1280x720__tim.png` (230K, 6 rows full-width), `1280x720__tim_detail.png` deep
  - Kompetisi: `1280x720__kompetisi.png` (699K, H1 44px two-tone, 3 cards top, poster gold 700KB right), `390x844__kompetisi.png` (451K, stack 409K long)
  - Dukungan: `390x844__dukungan.png` (134K, preset POPULER gold 150k + qty 50 + Total 150k), `1280x720__dukungan.png` (176K)
  - Tim slug: `390x844__tim_slug.png` (136K, SMPN1 #02, Informasi Kompetisi #02 bukan ranking, Klasemen disembunyikan yellow)
  - Timeline: `1280x720__timeline.png` (160K, 8 cols gold active 3-4), `390x844__timeline.png` (130K, vertical list + Status VOTING BERLANGSUNG emerald)
  - Others: `390x844__login.png` (87K), `1280x720__login.png` (139K), `390x844__search.png` (87K), `1280x720__search.png` (117K), `390x844__cara_dukung_modal.png` (71K — modal not captured, timing)
  - Deep: `390x844__hero_deep.png` (197K), `390x844__tim_deep.png` (128K), `390x844__dukungan_deep.png` (73K)
- **Computed sampled:** `results.json` headerH {101.75×390, 61×1280, 105.25×768, 124×412}, body bg `rgb(9,9,11)`, gold btn `rgb(201,168,106)` on `rgb(12,10,6)` PASS 9:1, `hasPodium false` all, `hasOverflow false` all, `title LKBB JAVASOMA — Peleton Terfavorit 2026` all routes
- **Code references:** `src/components/home/Hero.tsx:7-24 useCountdown`, `src/app/page.tsx:68-80 state→teams/podium`, `src/components/competition/Podium.tsx:302-315 keyframes crownBounce/medalPulse/laurelSway/floatY`, `src/components/peleton/PeletonCard.tsx:47-88 photo 4/3 void`, `src/components/layout/Navbar.tsx:13-216 double header`, `src/app/globals.css:50-393 tokens & clamp & focus`, `src/app/dukungan/page.tsx:111-199 presets`
- **State:** `Aktif — Dukungan Dibuka` (Timeline stage 4 Voting Dibuka gold active, results hasClosed false, 6 peletons 02/07/08 +01/03/04, verified)

---

*Audit generated from visual Playwright inspection (96 fullPage PNG) + source code verification. No files modified, no deploy — only this report. 2026-09-11.*


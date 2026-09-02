# LKBB Voting — Dynamic Admin Dashboard / CMS Architecture

> Arsitektur CMS dinamis tanpa edit kode manual. Semua teks, gambar, banner, struktur halaman disimpan di database. Implementasi: Next.js 16 + Supabase (Postgres + Storage + RLS).

---

## 1. Ringkasan Arsitektur (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                          │
│  /admin/cms (Pages+Sections)  /admin/media  /admin/settings     │
│  /admin/access (RBAC)  /admin/peleton  ...                     │
│                          ▲                                      │
│                          │  /api/admin/*  (service_role + RLS)  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │      Supabase Layer     │
              │  Postgres (RLS) + Storage (bucket: media) │
              └────────────┬────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    PUBLIC WEBSITE (SSR/ISR)                     │
│  Hero/cms ──►  getSectionsForPage("home")  ──►  cms_sections   │
│  Navbar/Footer ─► getPublicSettings()  ──► site_settings        │
│  Peleton list ─► team_ranking / peletons                        │
│  Media URLs ─► media_library + storage public URL               │
└─────────────────────────────────────────────────────────────────┘
```

**Prinsip:**
- **Database as Source of Truth** — semua konten yang sebelumnya hardcode di `src/lib/config.ts` dan komponen `Hero` kini di `cms_sections.content` + `site_settings.value`.
- **JSONB Fleksibel** — `settings` & `content` di `cms_sections` adalah JSONB, jadi tipe section baru bisa ditambah tanpa migrasi.
- **RLS + Service Role** — public hanya bisa `SELECT` yang `is_published/is_visible/is_public = true`. Admin `INSERT/UPDATE/DELETE` via `service_role` setelah cek `requireAdmin()` (ADMIN/SUPER_ADMIN/EDITOR).
- **Graceful Fallback** — jika tabel `cms_*` belum ada (sebelum migrasi 010 di-apply), frontend fallback ke hardcode + `competitions` table, jadi tidak breaking.

---

## 2. Database Schema — `supabase/migrations/010_dynamic_cms.sql`

### 2.1 `cms_pages` — definisi halaman
```sql
id uuid PK, slug text UNIQUE ( "home","tim","kompetisi",... ),
title text, description text,
is_system bool, is_published bool,
seo_title/seo_description/seo_image text,
sort_order int, created_by uuid, created_at/updated_at
```
Seed: 8 halaman (`home`,`tim`,`kompetisi`,`peraturan`,`timeline`,`juri`,`pengumuman`,`kontak`) — `is_system=true` untuk `home,tim,kompetisi` (slug tidak boleh dihapus).

### 2.2 `cms_sections` — blok penyusun halaman
```sql
id uuid PK, page_id uuid FK cms_pages,
key text, title text,
type text CHECK (hero,banner,text_block,rich_text,image,gallery,video,stats,list,grid,timeline,faq,sponsors,cta,countdown,podium,featured,custom),
is_visible bool, sort_order int,
settings jsonb, content jsonb,
created_by uuid
UNIQUE(page_id,key)
```
- `sort_order` → urutan render di frontend.
- `is_visible` → toggle tampil/sembunyi tanpa hapus.
- `settings` → layout variant (`{variant:"dark", columns:3}`).
- `content` → data aktual (`{headingLine1:"PELETON", backgroundImage:"https://..."}`).

Seed home:
- `hero` (hero), `countdown`, `featured`, `podium`, `sponsors`, `cta` — semua `is_visible=true`.

### 2.3 `site_settings` — pengaturan umum (key-value global)
```sql
id uuid PK, key text UNIQUE ("site.name","branding.logo","contact.email",...),
value jsonb, category text CHECK (general,branding,contact,social,appearance,seo,event,integration,advanced),
description text, is_public bool, is_system bool, updated_by uuid
```
Seed 18 keys: `site.name`, `site.subtitle`, `site.tagline`, `branding.logo` (4 logos), `contact.*` (4), `social.*` (3), `appearance.*` (2), `seo.*` (2), `event.dates/state`.

> Menggantikan `competitionConfig` hardcode — `src/lib/config.ts` sekarang fallback saja. Source of truth adalah `site_settings` + `competitions.state`.

### 2.4 `media_library` — sentral aset
```sql
id uuid PK, file_name, original_name, url, storage_path,
mime_type, size int, width/height int,
alt_text, caption, folder text CHECK (general,hero,banner,peleton,sponsors,juri,poster,branding,gallery,other),
tags text[], uploaded_by uuid
```
- Terhubung ke Storage bucket `media` (`storage.objects`).
- Upload via `/api/admin/media/upload` → `storage.from("media").upload()` → `getPublicUrl()` → insert `media_library`.

### 2.5 RBAC — granular permissions
```sql
permissions (key UNIQUE, name, description, category),
role_permissions (role, permission_key PK, granted bool),
user_permissions (user_id, permission_key PK, granted bool),
-- extended profiles.role CHECK to include 'EDITOR'
```
Seed 19 permissions: `cms.pages.read/write`, `cms.sections.read/write/publish`, `media.*` (3), `settings.read/write`, `users.*` (3), `peletons.*` (2), `transactions.*` (2), `system.audit/admin`.

`role_permissions` seed:
- `SUPER_ADMIN`: all 19
- `ADMIN`: all kecuali `users.permissions` & `system.admin`
- `EDITOR`: hanya `cms.*`, `media.read/upload`, `settings.read`, `peletons.*`, `transactions.read`

Helper: `src/lib/rbac.ts` (`hasPermission`, `checkPermissionDB`, `ROUTE_PERMISSIONS`).

### 2.6 `cms_revisions` — audit trail konten
```sql
id uuid PK, entity_type CHECK(page,section,setting,media),
entity_id uuid, action CHECK(create,update,delete,reorder,publish,unpublish),
before/after jsonb, changed_by uuid
```

### 2.7 RLS
- `public read published pages` / `visible sections` / `public settings` / `public read media` / `public read permissions` — `SELECT using (is_published/is_visible/is_public=true)`
- `admin all ...` — `using (is_cms_admin())` where `is_cms_admin() = EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('ADMIN','SUPER_ADMIN','EDITOR'))`
- `super_admin manage role_perms/user_perms` — only `SUPER_ADMIN`

---

## 3. Backend API Layer

### 3.1 Public (no auth) — untuk SSR
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/cms/pages` | GET | list published pages (`?include=sections` untuk embed) |
| `/api/cms/pages/[slug]` | GET | single page + visible sections |
| `/api/cms/settings` | GET | `?category=` filter, return `{settings: map, rows}` public only |

Helper lib: `src/lib/cms.ts`
- `getPublishedPages()`, `getPageBySlug(slug)`, `getSectionsForPage(slug)`, `getPublicSettings()`, `getSectionsForPageServer()`
- `getContent(section,key,fallback)` — ambil field dari `content` dengan fallback.

### 3.2 Admin (requireAdmin) — CMS
| Endpoint | Method |
|----------|--------|
| `/api/admin/cms/pages` | GET list + sections_count, POST create, PATCH update, DELETE |
| `/api/admin/cms/sections` | GET `?page_id`/`?slug`, POST, PATCH, DELETE |
| `/api/admin/cms/sections/reorder` | POST `{page_id, orderedIds}` |

### 3.3 Admin — Media
| Endpoint | Method |
|----------|--------|
| `/api/admin/media` | GET `?folder&search&limit&offset` + count, PATCH update meta, DELETE (hapus storage + row) |
| `/api/admin/media/upload` | POST multipart `file,folder,alt_text,caption` → storage + `media_library` |

### 3.4 Admin — Settings
| Endpoint | Method |
|----------|--------|
| `/api/admin/settings` | GET grouped+map, PATCH bulk `{updates:[{key,value}]}` atau single `{key,value}`, POST create, DELETE |

### 3.5 Admin — RBAC
| Endpoint | Method |
|----------|--------|
| `/api/admin/permissions` | GET matrix + profiles, PATCH toggle role_perm, POST/DELETE user override |

Semua admin route:
- `requireAdmin()` dari `src/lib/auth.ts` (cek `profiles.role IN (ADMIN,SUPER_ADMIN,EDITOR)` via `auth.getUser()`).
- Insert `audit_logs` + `cms_revisions` setiap mutasi.
- `middleware.ts` diperbarui: `/admin/*` dan `/api/admin/*` allow `EDITOR`.

---

## 4. Admin UI — `src/app/admin/*`

### 4.1 Navigasi Baru — `src/components/admin/AdminNav.tsx:9`
```
[CMS DINAMIS]
  /admin/cms         — Konten Dinamis (Layers icon)
  /admin/media       — Media Manager (Image icon)
[ KOMPETISI ]
  /admin/peleton ... /admin/sponsor
[ SISTEM ]
  /admin/users       — Pengguna
  /admin/access      — Hak Akses (Shield) — NEW
  /admin/settings    — Pengaturan (extended)
  /admin/audit-log
```
- Desktop: grouped dengan label. Mobile: sheet dengan active state `path.startsWith`.

### 4.2 `/admin/cms` — `src/app/admin/cms/page.tsx`
- **List pages**: card per page (`/{slug}`, badge `Sistem`/`Publish`/`Draft`, `#{sort_order} • {sections_count} section`, SEO preview).
- **CRUD**: Dialog tambah/ubah (slug, title, description, SEO, publish, sort_order). Hapus diblok untuk `is_system`. Link `Kelola Konten` → `/admin/cms/[slug]`, `Lihat` → `/{slug}` (new tab).
- Fetch: `GET /api/admin/cms/pages`.

### 4.3 `/admin/cms/[slug]` — `src/app/admin/cms/[slug]/page.tsx` (Section Builder)
Fitur utama **Dynamic Content Management**:
- Header: breadcrumb, badge publish, `Pratinjau Halaman`.
- **Reorder**: ↑↓ buttons → `POST /api/admin/cms/sections/reorder`.
- **Visibility toggle**: Eye/EyeOff → `PATCH is_visible`.
- **CRUD Section**: Dialog dengan:
  - `key` (unique per page, disabled saat edit), `title`, `type` (Select 17 opsi), `sort_order`, `is_visible`.
  - **Konten Dinamis**: `SectionContentEditor` — auto-detect image fields (key contains `image/logo/poster/src/banner` atau value `https://...jpg`) → tampil `Input + Pilih Media` button + preview. Field lain: `<Input>` atau `<textarea>` jika panjang >80. Tombol `Tambah Field` untuk key custom. + `details` JSON raw untuk advanced.
  - **Settings**: textarea JSON untuk variant/layout.
  - Preset: `CONTENT_PRESETS` untuk `hero,countdown,featured,cta,banner,text_block,image` — otomatis isi saat ganti type (add mode).

Contoh `hero` content keys: `eyebrow,headingLine1,headingLine2,subtitle,subtitle2,tagline,description,ctaPrimaryLabel,ctaPrimaryLink,ctaSecondaryLabel,backgroundImage,logoImage`.

### 4.4 `/admin/media` — `src/app/admin/media/page.tsx`
**CRUD & Media Manager**:
- Upload: `<input type="file" multiple>` → `POST /api/admin/media/upload` (per file, max 10MB, allow `image/*,video/*,pdf`).
- Filter: `search` (ilike `original_name`) + `folder` Select (11 opsi) + `Refresh`.
- Grid: 2-4 cols card (preview `aspect-[4/3]`, name, folder badge, size, alt, actions: `Salin URL` (clipboard), `Edit`, `Hapus`).
- Edit: Dialog (preview besar, URL mono, `alt_text`, `caption`, `folder`, `tags` comma-separated) → `PATCH /api/admin/media`.
- Preview: Dialog besar (max-h 420px) + `Salin URL`/`Edit`.
- Delete: `DELETE /api/admin/media?id=` → `storage.remove()` + row delete.
- Catatan: URL publik, paste ke CMS section field gambar → langsung tampil tanpa deploy.

### 4.5 `/admin/settings` — `src/app/admin/settings/page.tsx` (Enhanced)
Dulu hanya `competitions` state/harga/WA. Sekarang **tab-based** 7 kategori, consume `site_settings`:
- Tabs: `Umum` (site.name/subtitle/tagline/organizer/description), `Branding` (4 logo/poster + MediaPicker folder=branding), `Kontak` (email, WA umum/SMP/SMA, address), `Sosial` (IG/YT/TT), `Tampilan` (primary_color, theme), `SEO` (title/description default), `Event & Voting` (legacy: name/subtitle/tagline/state, harga online/offline, provisional/final toggles).
- Setiap tab: `Input` + `Button Simpan` → `PATCH /api/admin/settings {updates:[{key,value,category}]}`.
- Tab Event tetap pakai `POST /api/admin/competitions PATCH field/settings`.
- Footer: audit notice + collapsible `Lihat semua site_settings (advanced)` (list raw `key/value/category`).

### 4.6 `/admin/access` — `src/app/admin/access/page.tsx` (Hak Akses)
**Settings & Access Control**:
- **Role cards**: `SUPER_ADMIN` (Crown, amber), `ADMIN`, `EDITOR` — show `Granted: X/19`.
- **Matrix**: Select `selectedRole` → group by `category` (cms/media/settings/users/peletons/transactions/system) → list per permission: `name`, `key`, `description` + checkbox ( Hijau jika `granted`, abu jika tidak) → `PATCH /api/admin/permissions {role,permission_key,granted}` (hanya SUPER_ADMIN).
- **Daftar Pengguna**: table (NAMA, EMAIL, PERAN badge, Aksi `Kelola`) → Dialog ganti `role` (USER/EDITOR/ADMIN/SUPER_ADMIN) → `PATCH /api/admin/crud table=profiles`.
- Info: `SUPER_ADMIN` only untuk matrix; perubahan langsung berlaku di middleware; `EDITOR` tidak boleh `users.permissions`/`system.admin`.

### 4.7 `/admin/users` & `/admin/roles` — existing, tetap. `access` adalah enhancement granular.

### 4.8 Helper Components
- `src/components/admin/MediaPicker.tsx` — Dialog pilih media (grid 2-4 cols, search, upload inline folder, `onSelect(url)`).
- `src/components/cms/CmsSectionRenderer.tsx` — `CmsSections` / `CmsSectionRenderer` mapping `type` → JSX (hero fallback, banner, cta, text_block, rich_text, image, gallery, stats). Dipakai di `src/app/page.tsx`.

---

## 5. Frontend Dynamic Integration

### 5.1 `src/components/home/Hero.tsx` — dynamic
Ditambah prop `cms?: section`:
```ts
export function Hero({ event, cms }: { event:any; cms?: any })
```
- Jika `cms` ada, ambil `cms.content.*` (eyebrow, headingLine1/2, subtitle/tagline, description, cta*, backgroundImage, logoImage) dan `cms.settings.overlayOpacity/showLogo`. Fallback ke hardcode jika tidak ada. `if (cms.is_visible===false) return null`.

### 5.2 `src/components/layout/Navbar.tsx` & `Footer.tsx` — dynamic
Prop opsional `siteSettings?: Record<string,any>`. `useEffect` fetch `/api/cms/settings` jika tidak ada prop. Override:
- `site.name`, `site.subtitle`, `site.tagline`, `branding.logo` → logo & text.
- `site.description`, `site.organizer`, `branding.logo_*`, `contact.*`, `social.*` → footer.

### 5.3 `src/app/page.tsx` — home SSR
```ts
let cmsSections=[], siteSettings={}
try{
  const {data:page}=await supabase.from("cms_pages").select("id").eq("slug","home").single()
  if(page) { const {data:secs}=await supabase.from("cms_sections").select("*").eq("page_id",page.id).eq("is_visible",true).order("sort_order"); cmsSections=secs||[] }
  const {data:rows}=await supabase.from("site_settings").select("key,value").eq("is_public",true); for(const r of rows) siteSettings[r.key]=r.value
} catch{}
const heroSection = cmsSections.find(s=> s.key==="hero"||s.type==="hero")
const extraSections = cmsSections.filter(...)
return (
  <Navbar siteSettings={siteSettings} />
  <Hero event={ev} cms={heroSection} />
  <CmsSections sections={extraWithSortBeforeFeatured} />
  {isPublished && showPodiumViaCms && <PodiumSection .../>}
  {showFeatured && <Featured .../>}
  <CmsSections sections={extraAfterFeatured} />
  <Footer siteSettings={siteSettings} />
)
```
- Jika `cms_sections` belum ada (pre-migration), `try/catch` fallback → hardcode tetap jalan.
- `showFeatured/showPodiumViaCms` cek `is_visible` dari section `featured`/`podium`.

### 5.4 `src/lib/cms.ts`
Public helpers + server helpers (`getSectionsForPageServer`) untuk reuse di page lain (misal `kompetisi`, `peraturan` bisa fetch `cms_sections` serupa).

---

## 6. RBAC Flow

```
Login → supabase.auth.getUser() → profiles.role
      → middleware.ts: allow /admin if role IN (ADMIN,SUPER_ADMIN,EDITOR) else redirect /
      → /api/admin/*: requireAdmin() → check role, else 401/403
      → granular: requirePermission(key) → cek role_permissions/user_permissions → hasPermission fallback
UI:
  - AdminNav tampil untuk isAdmin (ADMIN/SUPER_ADMIN/EDITOR) — dari src/lib/store.tsx: isAdmin = role IN (ADMIN,SUPER_ADMIN,EDITOR)
  - /admin/access matrix hanya bisa di-PATCH oleh SUPER_ADMIN (server check)
  - /api/admin/crud: EDITOR diblok untuk profiles/audit_logs
```

**Test matrix:**
- `SUPER_ADMIN`: full.
- `ADMIN`: bisa semua kecuali ganti `role_permissions` / `system.admin`.
- `EDITOR`: bisa `cms/pages/sections` (CRUD+publish), `media upload/read` (tapi tidak delete), `peletons` CRUD, `settings read-only`, `transactions read`.
- `USER`: tidak bisa akses `/admin` (middleware redirect).

---

## 7. Cara Pakai (Admin)

1. **Apply migrasi 010**:
   ```bash
   # via Supabase Dashboard → SQL Editor → paste supabase/migrations/010_dynamic_cms.sql
   # atau via CLI:
   supabase db push
   # atau: psql $DATABASE_URL -f supabase/migrations/010_dynamic_cms.sql
   ```
   Verifikasi: `SELECT * FROM cms_pages;` → 8 rows, `SELECT * FROM site_settings;` → 18 rows.

2. **Login sebagai SUPER_ADMIN** (seed sudah ada? buat via `profiles` update role).

3. **Kelola Halaman**:
   - Buka `/admin/cms` → `Tambah Halaman` → isi slug `about-us`, title `Tentang Kami` → `Buat`.
   - Klik `Kelola Konten` → `Tambah Section` → pilih `type=hero`, isi `headingLine1`, `backgroundImage` via `Pilih Media` → `Tambah`.

4. **Media**:
   - Buka `/admin/media` → `Upload Media` (pilih file) → `Salin URL` → paste di CMS section field gambar (atau pakai `Pilih Media` langsung).

5. **Pengaturan**:
   - Buka `/admin/settings` → tab `Branding` → `Pilih Media` untuk ganti logo → `Simpan Branding` → refresh homepage, logo Navbar/Footer langsung ganti.
   - Tab `Event & Voting` → ganti `Status Event` → `Simpan` → voting langsung buka/tutup (server 403 jika tidak ACTIVE).

6. **Hak Akses**:
   - Buka `/admin/access` → pilih `EDITOR` di dropdown matrix → centang/uncen tang permission → otomatis tersimpan.
   - Ganti role user: `Kelola` di tabel pengguna → pilih `EDITOR` → `Simpan` → user tersebut langsung bisa akses `/admin/cms` tapi tidak `/admin/access`.

---

## 8. File Map — yang ditambah/diubah

```
supabase/migrations/010_dynamic_cms.sql    (NEW — 400+ lines)
src/lib/rbac.ts                            (NEW)
src/lib/cms.ts                             (NEW)
src/components/admin/MediaPicker.tsx       (NEW)
src/components/cms/CmsSectionRenderer.tsx  (NEW)
src/app/api/cms/pages/route.ts             (NEW)
src/app/api/cms/pages/[slug]/route.ts      (NEW)
src/app/api/cms/settings/route.ts          (NEW)
src/app/api/admin/cms/pages/route.ts       (NEW)
src/app/api/admin/cms/sections/route.ts    (NEW)
src/app/api/admin/cms/sections/reorder/route.ts (NEW)
src/app/api/admin/media/route.ts           (NEW)
src/app/api/admin/media/upload/route.ts    (NEW)
src/app/api/admin/settings/route.ts        (NEW)
src/app/api/admin/permissions/route.ts     (NEW)
src/app/admin/cms/page.tsx                 (NEW)
src/app/admin/cms/[slug]/page.tsx          (NEW)
src/app/admin/media/page.tsx               (NEW)
src/app/admin/access/page.tsx              (NEW)
src/components/admin/AdminNav.tsx          (MOD — grouped nav, 3 new items)
src/components/home/Hero.tsx               (MOD — cms prop + dynamic fields)
src/components/layout/Navbar.tsx           (MOD — siteSettings dynamic)
src/components/layout/Footer.tsx           (MOD — siteSettings dynamic)
src/app/page.tsx                           (MOD — fetch cms_sections + site_settings)
src/app/admin/settings/page.tsx            (MOD — 7 tabs + site_settings CRUD)
src/app/admin/layout.tsx                   (MOD — allow EDITOR)
src/app/api/admin/crud/route.ts            (MOD — allow EDITOR with guard)
src/lib/auth.ts                            (MOD — requireAdmin EDITOR + requirePermission)
src/lib/store.tsx                          (MOD — isAdmin includes EDITOR)
middleware.ts                              (MOD — allow EDITOR)
```

---

## 9. Verifikasi

- `npm run build` → ✓ Compiled, TypeScript passed, 79 routes (termasuk 13 route baru).
- Fallback: homepage tetap render jika `cms_pages` belum ada (try/catch).
- RLS: public anon tetap bisa SELECT published/visible/public only.
- Storage: bucket `media` reusable, policy `public read media` sudah ada di 002 + 010.

---

## 10. Next Steps (opsional)

- Tambah draggable (dnd-kit) untuk reorder sections (sekarang ↑↓).
- Tambah live preview iframe di `/admin/cms/[slug]` (render `CmsSectionRenderer` di preview pane).
- Tambah versioning UI untuk `cms_revisions` (diff before/after).
- Tambah `site_settings` image crop (sudah ada `ImageCropDialog` di peleton, reusable).
- Tambah `permissions` UI untuk `user_permissions` override per-user (sekarang hanya role).


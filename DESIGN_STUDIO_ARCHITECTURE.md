# DESIGN STUDIO — Architecture Audit & Blueprint

> Visual Website Editor untuk LKBB — Canva/Figma-like, aman terhadap business logic.

**Project:** `/home/reja/lkbbvoting` — Next.js 16 App Router + Supabase + Tailwind v4
**Date:** 2026-09-11
**Status:** AUDIT → ARCHITECTURE (pre-implementation)
**Website:** `https://lkbbvoting.my.id` — Dark-first LKBB Javasoma

---

## 1. Executive Summary

LKBB sudah memiliki **CMS dinamis** (`cms_pages` + `cms_sections` + `site_settings` + `media_library` via `010_dynamic_cms.sql`) yang menyimpan konten sebagai JSONB + `is_visible` toggle — ini **fondasi 60% Design Studio**. Yang belum ada adalah **visual canvas, selection, properties, layers, responsive override, undo/redo, versioning draft/publish, dan protected-system guard**.

Design Studio **bukan rewrite**. Ia adalah **lapisan visual editing** di atas renderer yang sudah ada: **adapter** `src/components/cms/CmsSectionRenderer.tsx` + **page schema** `cms_sections` + **media** `media_library` + **RBAC** `role_permissions`. Business logic (payment DOKU, ballot ledger `supports`, `transactions`, `team_ranking` view, voting state machine `competitions.state`) **tidak tersentuh** — hanya `style` + `content` di `cms_sections` + `site_settings` yang di-edit.

---

## 2. Repository Audit — Existing Truth

### 2.1 Project Structure
```
src/
  app/
    page.tsx              # Beranda: Hero + Featured + PodiumSection + CmsSections (SSR cms_sections)
    tim/page.tsx          # Daftar Tim: team_ranking vs peletons fallback
    tim/[slug]/page.tsx   # Detail Peleton: photo, ranking, dukungan
    kompetisi/page.tsx    # Kompetisi: 3 info cards + Tentang + Juri + Poster
    dukungan/page.tsx     # Support flow: presets 10/50/100/300 + qty stepper + checkout
    checkout/             # QRIS DOKU webhook
    profile/*, login, register, search, klasemen→tim, timeline, peraturan, juri, sponsor, tentang
    admin/
      page.tsx            # Dashboard operasional
      peleton/            # CRUD peleton (SMP/SMA number per kategori)
      offline-recap/      # Ledger supports offline
      cms/page.tsx        # List pages (cms_pages)
      cms/[slug]/page.tsx # Section builder (cms_sections CRUD + reorder + visibility)
      media/              # Media Manager (media_library)
      settings/           # site_settings 7 tabs
      access/             # RBAC matrix role_permissions
      layout.tsx          # allow EDITOR
  components/
    home/Hero.tsx         # Dynamic via cms.content (eyebrow, headingLine1/2, backgroundImage, overlayOpacity, countdown)
    home/Featured.tsx     # SMP/SMA grid PeletonCard
    peleton/PeletonCard.tsx # Photo 16/10, logo, fav heart, DUKUNG ghost
    competition/Podium.tsx # Shield podium (3 cards, crown, laurel, JUARA bar)
    cms/CmsSectionRenderer.tsx # Mapping type→JSX (hero, banner, text_block, image, stats, etc.)
    layout/Navbar.tsx, Footer.tsx, BottomNav.tsx
    admin/AdminNav.tsx    # Grouped: CMS DINAMIS, KOMPETISI, SISTEM
  lib/
    cms.ts                # getPublishedPages, getSectionsForPage, getPublicSettings
    rbac.ts               # hasPermission, ROLES: SUPER_ADMIN/ADMIN/EDITOR/USER
    supabase.ts           # createBrowserSupabase, createServerSupabase, createServiceSupabase
  supabase/migrations/
    001_initial_schema.sql      # profiles, peletons, supports, transactions, competitions, sponsors, judges, news, timeline, audit_logs
    002_fix_spec_compliance.sql # peletons (display_order trigger, number+category unique), team_ranking view
    010_dynamic_cms.sql         # cms_pages, cms_sections (17 types), site_settings (18 keys), media_library, permissions (19), cms_revisions
    011-017 ...                 # state fix, DOKU, display_order sync, offline recap, etc.
```

**Key discovery:** `Hero`, `Featured`, `PodiumSection` sudah **dynamic-aware** (`cms?.is_visible`, `siteSettings["hero.background_image"]`, `getSectionsForPage("home")`), tetapi **masih hardcode layout** (Hero 2 CTA, Featured 2 grids, Podium 2×3 shields). Untuk Design Studio, mereka harus menjadi **editable sections** via schema.

### 2.2 Database — Supabase (ghunqfsgrcqkueaqklcg)
- **cms_pages** (8 seeded): `home`, `tim`, `kompetisi`, `peraturan`, `timeline`, `juri`, `pengumuman`, `kontak` — `is_system` true for home/tim/kompetisi.
- **cms_sections**: `id, page_id, key (unique per page), title, type (17), is_visible, sort_order, settings jsonb, content jsonb`. Seed home: `hero, countdown, featured, podium, sponsors, cta`. `settings` = layout variant, `content` = data.
- **site_settings**: 18 keys (`site.name`, `branding.logo`, `contact.*`, `social.*`, `appearance.*`, `seo.*`, `event.*`) + `hero.background_image` etc. — JSONB `value`.
- **media_library**: `file_name, url, storage_path, mime_type, folder (11)`, bucket `media` public.
- **permissions**: 19 keys (`cms.pages.read/write`, `cms.sections.*`, `media.*`, `settings.*`, `users.*`, `peletons.*`, `transactions.*`, `system.*`), `role_permissions` seed SUPER_ADMIN all, ADMIN all except `users.permissions`, EDITOR only cms/media/peleton.
- **competitions**: `id, name, state (NOT_STARTED/ACTIVE/VOTING_OPEN/VOTING_CLOSED/RESULT_PUBLISHED/COMPLETED), voting_start, voting_end, event_date, event_time, settings jsonb (online_price/offline_price/ballot_presets), created_at`. Current: `ACTIVE`, `event_date 2026-10-24`.
- **peletons**: `id, slug, number, name, school, city, province, category SMP/SMA, image_url, logo_url, display_order trigger sync numeric(number), verified, active, support_count`. Unique `number+category` + functional `category+numeric(number)` via `017_sync_display_order`.
- **supports**: `id, peleton_id, user_id, transaction_id, amount, supports (int -10000..10000), source online/offline, note, admin_id, created_at` — **immutable ledger**, `team_ranking` view = `sum online/offline/total`.
- **transactions**: `id, user_id, peleton_id, amount, supports, method, status Pending/Success/Failed/Expired, provider DOKU, provider_ref, expires_at`.
- **profiles**: `id (auth.users), email, public_name, role USER/ADMIN/SUPER_ADMIN/EDITOR, avatar_url`.
- **Storage**: buckets `media`, `avatars` public, RLS `public read media` + `admin all`.

### 2.3 Page Renderer — Current
- **Beranda** `src/app/page.tsx`: SSR `get cms_sections for home where is_visible true order sort_order` + `site_settings where is_public true` → `Hero(event, heroSection)`, `CmsSections(extra)`, `PodiumSection(smp/sma, isPublished)`, `Featured(peletons)`. Fallback to hardcode if `cms_pages` missing (try/catch). `isPublished||isVotingClosed` → podium, `isVotingClosed` banner.
- **Tim** `src/app/tim/page.tsx`: `team_ranking order total/online` vs fallback `peletons order category,number`.
- **Other**: `kompetisi`, `dukungan`, `profile`, etc. — mostly **not yet CMS-driven**, hardcode JSX.

**For Design Studio:** `page.tsx` renderer harus **diadaptasi** menjadi `EditablePageRenderer` yang membaca `page_schema` JSON (dari `cms_sections` terkomposisi) dan me-render via **same components** (`Hero`, `Featured`, `Podium`) tapi dengan **editable wrapper** (`data-editable-id`, `data-protected`).

### 2.4 Admin System — Existing
- **Auth**: `createServerClient` + `cookies`, `requireAdmin()` cek `profiles.role IN (ADMIN,SUPER_ADMIN,EDITOR)`, `middleware.ts` allow `/admin/*` for those roles.
- **API**: `/api/admin/cms/pages|sections|reorder|media|settings|permissions` — `service_role` + `audit_logs` + `cms_revisions` (entity_type, action, before/after).
- **UI**: `AdminNav.tsx` grouped, `admin/cms/page.tsx` list pages, `admin/cms/[slug]/page.tsx` section builder (key, title, type, is_visible, sort_order, content JSON via `SectionContentEditor` + `MediaPicker`, settings JSON, reorder ↑↓, visibility eye).
- **RBAC**: `hasPermission`, `ROUTE_PERMISSIONS`, matrix di `/admin/access`.

**For Design Studio:** Reuse `requireAdmin`, `audit_logs`, `cms_revisions` — tambah `design_pages` atau reuse `cms_sections` sebagai **page schema store** dengan `draft/published` split.

### 2.5 Business-Critical — Must Not Break
| Domain | Table / Logic | Protected? | Why |
|---|---|---|---|
| Payment | `transactions` + DOKU webhook `/api/payment/webhook/doku` | **SYSTEM** | Ballot only after `Success` validated, `provider_ref` unique, `expires_at` 15min |
| Ballot ledger | `supports` + `team_ranking` view | **SYSTEM** | Immutable, `source online/offline`, sum determines ranking |
| Voting state | `competitions.state` + `isActive` guard di `dukungan` + `transactions` POST | **PROTECTED** | `VOTING_CLOSED` blocks new transactions |
| Ranking | `team_ranking` view `online_ballots/offline_ballots/total` | **PROTECTED** | Display `online` preview vs `total` final |
| Auth | `auth.users` + `profiles` | **SYSTEM** | RLS, `requireAdmin` |
| Team data | `peletons` number+category unique | **PROTECTED** | Number = urutan tampil per kategori |
| Admin | `audit_logs`, `cms_revisions` | **SYSTEM** | Trail |

**Design Studio hanya boleh edit `cms_sections.content/style` + `site_settings.value` (appearance.category) — tidak `supports`, `transactions`, `competitions.state` secara langsung via style.**

### 2.6 Responsive System — Current
- **Tailwind v4** `@import "tailwindcss"` + `@theme inline` with `--breakpoint-xs:360px --breakpoint-2xs:320px` (added in `globals.css:40-41` for mobile-first), `container-premium max-w 1280 px-3 sm:px-4 md:px-6`, `section-pad 48/32`, `grid-gap-premium 24/16/12`.
- **Breakpoints tested:** 360×800, 390×844, 412×915, 768×1024, 1280×720, 1366×768, 1440×900, 1920×1080 — `no horizontal overflow` verified via `scrollWidth === innerWidth` 96/96.
- **Navbar:** sticky `top-0 z-50 h-56 sm:58 lg:60 border-b border-white/[0.06] bg-background/72 backdrop-blur 14px`, mobile single row 56px + overlay search `h-56` (fixed from double 101px), `h-11 w-11` 44px hit.
- **Hero:** `h1 32 xs36 sm42 md56 lg68 xl76 gold-gradient` (1 line gold), `countdown 4 cols gap1-3` `22→32px tabular`, `CTA 44px gold primary + 38px ghost`, `aspect 4/3 sm:16/10` photo.
- **Podium:** `grid grid-cols-3 w-full` shields `h 212-404` responsive, `xs` breakpoint active.

**For Design Studio:** Canvas must **inherit** this system, provide `Desktop (1280) / Tablet (768) / Mobile (390)` switcher, use `inherit` for responsive overrides (desktop base + tablet/mobile override only if diff), not duplicate full style per breakpoint.

### 2.7 Design System — Current
- **Tokens:** `globals.css:48-109` — `--background #09090b, --card #111318, --primary #C9A86A, --muted #1A1D24, --border #23262F, --radius 0.875rem, --space 8-64, --text-hero clamp, --shadow subtle/soft/elevated, --ease premium`.
- **Utilities:** `gold-gradient-text, premium-card, gold-hairline-premium 0.5px, container-premium, section-pad, hairline-thin 0.5px`.
- **Typography:** `Inter var(--font-inter)` for sans/display, `h1,h2 800 -0.02em lh 0.95`, body `500 -0.01em 1.6`.
- **Components:** `Button` variants `default gold, outline white/12, ghost`, `Badge`, `Dialog`, `Card`, `PeletonCard` (photo 4/3, logo, fav heart, DUKUNG ghost), `Podium` shield chamfer 13px.

**For Design Studio:** Use **design tokens** panel: Colors (`primary, background, surface, border`), Typography (`Heading XL/L/M, Body, Small`), Spacing (`XS-2XL`), Radius, Shadows — change token → all `premium-card` + `gold-gradient-text` update.

---

## 3. Gap Analysis — What CMS Has vs Design Studio Needs

| CMS Existing | Design Studio Need | Gap |
|---|---|---|
| `cms_sections` per page `key, title, type, is_visible, sort_order, settings, content` JSONB | **Visual page schema** with `id, type, protected, style, responsive, children` tree, versioned | Add `page_schema` JSONB column or new `design_pages` + `page_versions` |
| `is_visible` toggle | **Hide vs Delete** + `visible: false` vs removed + protected guard | Need `protected` + `system` status + delete confirm |
| `sort_order` manual ↑↓ | **Drag reorder** + layer panel | Need dnd-kit, layer tree |
| `content` JSON flat | **Typed element props** (text: content, font, size, color; button: text, action, bg, radius; image: src, objectFit; section: padding, bg) | Need typed schema + validation |
| `site_settings` key-value | **Global tokens** (Colors, Typography, Spacing) + inheritance | Need token admin UI + CSS var sync |
| `media_library` | **Image replace** via click → MediaPicker | Already via `MediaPicker.tsx`, need canvas integration |
| `cms_revisions` (entity_type page/section) | **Version history** per page + undo/redo + draft/published | Need `page_versions` table (id, page_id, version, schema_json, draft/published, created_by, published_at) + client history stack |
| No canvas | **Canvas** real website preview, selection, bounding box, resize handles | Need `EditableRenderer` wrapper + `iframe` or `div` with `data-editable` |
| No responsive override | **Responsive editing** desktop base → tablet/mobile override inheritance | Need `style.desktop/tablet/mobile` merge |
| No positioning | **Flex/Grid flow + gap/padding** (not absolute chaos) | Enforce layout system |
| RBAC `requireAdmin` | **Protect SYSTEM actions** (support_team, ballot, payment) | Need `protected` check server-side |

---

## 4. Design Studio Architecture Blueprint

### 4.1 High-Level

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN → DESIGN STUDIO                     │
│  /admin/design-studio (new) — Canvas + Elements + Properties + Layers │
│  ┌──────────┬──────────────────────────┬──────────┐              │
│  │ ELEMENTS │      CANVAS (real)       │PROPERTIES│              │
│  │ +Text    │  <EditablePage page=home>│ Text     │              │
│  │ +Button  │   Hero, Featured, Podium │ Color    │              │
│  │ +Image   │   (same components)      │ Size     │              │
│  │ +Section │   data-editable-id      │ Spacing  │              │
│  │ LAYERS   │   outline+handles       │ Layers   │              │
│  └──────────┴──────────────────────────┴──────────┘              │
│  Viewport: Desktop  Tablet  Mobile  Zoom  Undo/Redo  Save  Publish│
└─────────────────────────────────────────────────────────────────┘
                          │  /api/design/* (service_role)
               ┌──────────┴──────────┐
               │   Supabase Layer    │
               │  design_pages       │  ← new: page schema store
               │  page_versions      │  ← versioning draft/published
               │  cms_sections (reuse) ← migration path
               │  site_settings (tokens) ──► CSS vars
               │  media_library ──────────► image src
               └─────────────────────┘
                          │
               ┌──────────┴──────────┐
               │  PUBLIC WEBSITE     │
               │  <PageRenderer page=home> reads published_schema
               │  Same components, no editor chrome
               └─────────────────────┘
```

**Reuse, not rewrite:** `Hero`, `PeletonCard`, `Podium` etc. are **same components** — wrapped with `Editable` HOC that adds `data-editable-id` + `onClick` selection when `isEditing`.

### 4.2 Database — Minimal New Tables (adapt if 010 already covers)

**Option A: Reuse `cms_sections` + Add `design_pages` for Studio**

```sql
-- Extend cms_sections for Studio (if reuse)
alter table cms_sections add column if not exists protected text default 'normal' check (protected in ('normal','protected','system'));
alter table cms_sections add column if not exists responsive jsonb default '{}';

-- New: design_pages for Studio canvas (if fresh)
create table if not exists design_pages (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null, -- home, tim, kompetisi
  title text not null,
  draft_schema jsonb not null default '{}',
  published_schema jsonb,
  version int not null default 1,
  updated_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists page_versions (
  id uuid primary key default uuid_generate_v4(),
  page_id uuid references design_pages(id) on delete cascade,
  version int not null,
  schema_json jsonb not null,
  is_published boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  published_at timestamptz,
  description text
);
create index if not exists idx_page_versions_page on page_versions(page_id, version desc);
```

**Alternative:** If team prefers no new table, **reuse `cms_sections` + `site_settings` as schema store**: Studio reads/writes `cms_sections` directly + `site_settings` for tokens, with `cms_revisions` as version history. Simpler, no migration. **Chosen for Phase 1** (reuse).

**Decision:** **Phase 1 reuse `cms_sections` + `site_settings`** — add `protected` column via migration `018_design_studio.sql` (small). `page_versions` can be **client-side history + `cms_revisions` table** for now, no need for new `design_pages` unless `cms_sections` proves insufficient for tree depth.

### 4.3 Page Schema — Structured JSON

```json
{
  "page": "home",
  "version": 3,
  "root": {
    "type": "page",
    "style": { "background": "var(--background)" },
    "children": [
      {
        "id": "hero",
        "type": "section",
        "protected": "normal",
        "visible": true,
        "style": { "padding": "var(--space-10)", "background": "var(--background)" },
        "responsive": { "mobile": { "style": { "padding": "12px" } } },
        "children": [
          {
            "id": "hero-title",
            "type": "text",
            "content": "Peleton Terfavorit",
            "protected": "normal",
            "style": { "fontSize": "76px", "fontWeight": "900", "color": "var(--primary)", "textAlign": "center" }
          },
          {
            "id": "support-button",
            "type": "button",
            "protected": "protected",
            "action": "support_team",
            "content": "Dukung",
            "style": { "background": "var(--primary)", "color": "var(--primary-foreground)", "radius": "999px" }
          }
        ]
      },
      {
        "id": "featured-smp",
        "type": "section",
        "visible": true,
        "children": [
          {
            "id": "team-card-template",
            "type": "component",
            "component": "PeletonCard",
            "protected": "protected",
            "props": { "showLogo": true, "showPhoto": true },
            "style": {}
          }
        ]
      }
    ]
  }
}
```

**Types:** `page, section, text, button, image, video, divider, icon, spacer, component` (for `PeletonCard`, `Countdown`, `Podium` etc.)

**Protected:** `normal` (full edit), `protected` (style/text only, action locked), `system` (no delete, style limited).

**Style:** CSS vars + raw values, stored as `style: { color, fontSize, padding }` + `responsive: { tablet: {style}, mobile: {style} }` inheritance.

### 4.4 Renderer — Single Source

```tsx
// Production
<PageRenderer slug="home" mode="live" />
// → fetch getSectionsForPage("home") where is_visible true
// → map type→Component (Hero, Featured, Podium, CmsSectionRenderer)

// Studio
<EditablePageRenderer slug="home" mode="edit" onSelect={setSelectedId} selectedId={id} />
// → same fetch but draft_schema
// → wrap each node: <div data-editable-id={node.id} data-protected={node.protected} onClick={...} className={selected ? "outline-2 outline-[#C9A86A]" : ""}>
// → same Component, but with editable props
```

**No duplicate components.** `Hero` remains `Hero`, but in edit mode it receives `editableContent` override.

### 4.5 Editor State — Client

```ts
type EditorState = {
  page: string; // home
  viewport: "desktop" | "tablet" | "mobile";
  zoom: number; // 50-200
  selectedId: string | null;
  schema: PageSchema; // current draft
  history: PageSchema[]; // undo stack
  future: PageSchema[]; // redo
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}

Actions: select, updateNode(id, patch), addNode(parentId, type), duplicate(id), delete(id) with guard, reorder(drag), hide/show, undo, redo, save (debounce), publish.
```

**Autosave:** `useEffect` on `schema` → debounce 1200ms → `POST /api/design/save {slug, draft_schema}` → `isSaving` → `✓ Saved`.

**Undo/Redo:** `history` push on every `updateNode` (before), `Ctrl+Z` → pop.

### 4.6 Layers Panel

Tree from `schema.root.children` recursive. Features: `eye` toggle `visible`, `lock` toggle `locked`, `drag` via `dnd-kit` sortable, `select` on click, `duplicate/delete` with guard.

### 4.7 Properties Panel — Progressive

Based on `selectedNode.type`:

- **Text:** `content` (Input), `fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, align, color, opacity, maxWidth`
- **Button:** `content, action (Select: support_team, team_profile, open_teams...), background, textColor, border, radius, padding, typography, shadow, hover`
- **Image:** `src (MediaPicker), objectFit, radius, opacity, alt`
- **Section:** `background, backgroundImage, padding, margin, maxWidth, border, radius, shadow`
- **Component** (PeletonCard): `showLogo, showPhoto, layout` (no data override)

**Protected UI:** If `protected === "protected"` → show `🔒 System Action` badge, disable `action` select + `delete` button, allow style/text only.

### 4.8 Responsive Editing

Top bar `Desktop | Tablet | Mobile` → `viewport` state. Canvas width: `desktop 1280, tablet 768, mobile 390` via `max-w-[1280px]` + `scale` or `width` style. `style` merge: `desktop` base + `responsive[viewport]` override.

```ts
const resolvedStyle = { ...node.style, ...(node.responsive?.[viewport]?.style || {}) }
```

### 4.9 Persistence — Reuse Existing

- **Draft:** `cms_sections` where `is_visible` + `content/style` is **draft** (edit directly, but not yet published? Better have `draft_schema` vs `published_schema`). For Phase 1, **directly update `cms_sections`** + `site_settings` — simple, publish = `is_visible` true means live. No draft/published split yet — **acceptable for MVP**, add `design_pages` draft/publish in Phase 8.
- **Version history:** Use existing `cms_revisions` table (entity_type `section`, action `update`, before/after). Studio will read `cms_revisions where entity_id = section.id order created_at desc` for history. Or create `page_versions` if need page-level snapshot.

**Chosen:** **Phase 1: direct `cms_sections` edit + `cms_revisions` history** — no new draft table, publish = save. Add `page_versions` only if `cms_revisions` per-section proves too granular.

### 4.10 Security — Must

- `requireAdmin()` + `hasPermission("cms.sections.write")` for all `/api/design/*` + `/api/admin/cms/*`.
- Server-side validation: `protected` nodes cannot have `action` changed to `javascript:` or `onerror`, `content` sanitized via `sanitizeHtml` (if rich text), `style` allowlist (no `expression`, no `url(javascript:`).
- RLS: `admin all cms_sections` via `is_cms_admin()`.

### 4.11 Migration Strategy — Phased

1. **Beranda** (`home`) — Hero + Featured + Podium (already dynamic) → make fully editable via schema.
2. **Tim** (`tim`) — Team grid + header
3. **Kompetisi** (`kompetisi`) — 3 info cards + poster
4. **Profile, Sponsor, etc.** — static pages

**Adapter:** `src/app/page.tsx` already does `getSectionsForPage("home")` — Studio will just edit those sections. No rewrite.

---

## 5. Implementation Phases

| Phase | Scope | Deliverable | Test |
|---|---|---|---|
| 1 | Audit + Architecture | This doc | — |
| 2 | Schema + Renderer | `design_pages` or `cms_sections` extended, `EditableRenderer` wrapper, `PageRenderer` unified | Build |
| 3 | Canvas + Selection | `/admin/design-studio` route, canvas real preview, click outline, bounding box, handles | Playwright select |
| 4 | Properties | Text/Button/Image/Section panels, MediaPicker integration | Playwright edit text/color |
| 5 | Layers | Tree, drag reorder, hide/show, duplicate, delete guard | Playwright layers |
| 6 | Responsive | Viewport switcher 1280/768/390, inherit override | Playwright mobile |
| 7 | Persistence | Autosave debounce, draft→published via `is_visible`, `cms_revisions` | Playwright save+reload |
| 8 | Undo/Redo, Version History | History stack, `cms_revisions` list, restore | Playwright undo/redo |
| 9 | Draft/Publish, Zoom, Add Element, Protected | Draft vs published, zoom 50-200, +Text/Button/Image, protected badge | Playwright publish |
| 10 | Security, Performance, Polish | Validation, lazy, memo, 44px | Build + Lint |
| 11 | Testing & Audit | 20 Playwright tests + visual, `DESIGN_STUDIO_AUDIT.md` | All PASS |

---

## 6. Risks & Mitigations

- **Business logic break:** Mitigated via `protected` + server validation + `action` allowlist.
- **Responsive chaos:** Mitigated via flex/grid flow, not absolute, gap/padding tokens.
- **Bundle bloat:** Studio route `dynamic import` + `lazy`, public `PageRenderer` no editor.
- **Storage ACL:** `media` bucket public, `MediaPicker` already handles.
- **Undo loss:** Client history + `cms_revisions` server, debounce 1.2s, retry on fail.

---

## 7. Next Step

After this audit, proceed to **Phase 2: Schema & Renderer** — create `/admin/design-studio` route + `EditablePage` wrapper + `page_schema` JSON handling, reusing `cms_sections`.

*End of Architecture — Ready for Implementation.*

# LKBB PELETON TERFAVORIT — FULL SYSTEM AUDIT

**Date:** 2026-09-01
**Project:** /home/reja/lkbbvoting
**Spec:** FINAL SPECIFICATION §81 — 35 categories

## AUDIT MATRIX

| Category | Current State | Expected State | Status | Problem | Fix Required |
|----------|---------------|----------------|--------|---------|--------------|
| **Database** | 15 tables, includes peleton_members/gallery obsolete, missing display_order/active, missing source in supports, missing unique on public_name | Simplified team (7 fields), no members/gallery, proper constraints, indexes, RLS | **FAIL** | Obsolete tables, missing columns, incomplete RLS, no indexes on ranking | Migration 002: add display_order/active, add source, add unique, drop obsolete, add indexes, fix RLS |
| **Authentication** | Mock localStorage (`src/lib/store.tsx:1` login(email) only), no DB uniqueness, no Google OAuth | Name unique DB-level, password + Google, Supabase Auth | **FAIL** | Frontend-only, no password hashing, no OAuth, no DB constraint | Add unique constraint, implement Supabase Auth, OAuth config, profile edit |
| **Users** | Hardcoded demo, no DB, no role enforcement | DB profiles with role, avatar, activity, status | **PARTIAL** | Users table exists but empty, no seed, no RLS | Seed users, add RLS, implement user management API |
| **Teams** | Hardcoded `src/lib/data.ts:1` peletons with members/gallery, hardcoded support numbers | DB-driven, 7 fields only, display_order, active | **FAIL** | Hardcoded, obsolete members/gallery, hardcoded support | Remove members/gallery from frontend, migrate DB, make frontend fetch from DB |
| **Homepage** | Uses `src/lib/data.ts` peletons hardcoded, follows display_order but hardcoded, event from `src/lib/config.ts:1` | DB-driven event, display_order, official assets | **PARTIAL** | Hardcoded event title/date/countdown, hardcoded teams | Make homepage fetch event + peletons ordered by display_order from DB |
| **Team Directory (/tim)** | Hardcoded, ordered by support but hardcoded support, participant number preserved | DB-driven, ordered by real support performance (online+offline), participant number preserved | **FAIL** | Hardcoded support values, not DB aggregation | Implement DB view ranking, preserve number, hide totals |
| **Team Detail (/tim/[slug])** | Shows hardcoded peleton with members/gallery, share buttons mock | DB-driven, photo+logo+number+name+category+CTA+share profile/support, no gallery/members | **FAIL** | Shows members/gallery which should be removed, hardcoded | Simplify to 1 photo +1 logo, remove gallery, make DB-driven |
| **Support** | Client-side mock, price hardcoded `src/lib/config.ts:1` Rp3k, no server calc | Server-calculated price, presets 10/50/100/300 + custom, configurable price | **FAIL** | Hardcoded price, no server validation | Move price to DB (competitions.settings), create POST /api/transactions with server calc |
| **Payment** | Mock `src/lib/services/payment.ts:1` client-only, no webhook, no idempotency, directly adds to history | Xendit Sandbox, server-verified, webhook, idempotency, states PENDING/PAID/FAILED/EXPIRED | **FAIL** | No server, no webhook, no idempotency, frontend marks paid directly | Implement /api/webhook/xendit, idempotency via provider_ref unique, ledger only on PAID |
| **Ballot** | Hardcoded support numbers, no ledger, no online/offline distinction | Online+offline ledger, auditable, aggregation | **FAIL** | No ledger, no distinction | Add source column, use supports table, calculate total via aggregation |
| **Ledger** | No ledger, support_count is fake | Immutable ledger supports (online) + offline via admin, with transaction_id, source, timestamp | **FAIL** | support_count is materialized but not derived from ledger | Use supports table, create aggregation view, ensure ledger is source of truth |
| **Realtime** | No realtime, mock | Supabase Realtime on ledger/ranking, scoped, cleanup | **MISSING** | No Realtime subscription | Add Realtime channel on supports/transactions, emit "[USER] mendukung [TEAM]" without exposing quantity |
| **Ranking** | Hardcoded `support` field, not derived, hidden totals but hardcoded | Real DB ranking SMP/SMA = online+offline, participant number ≠ ranking | **FAIL** | Hardcoded, not category-separated correctly, participant number confused | Create view ranking, API, ensure participant number preserved |
| **Offline Recap** | Hardcoded, no admin UI | Dedicated admin OFFLINE RECAP, add offline ballots with note, auditable | **MISSING** | No UI, no ledger | Create admin/offline-recap page, insert supports with source=offline, audit log |
| **Event State** | Hardcoded `state: "VOTING_OPEN"` in config.ts | DB-driven PRE_EVENT/ACTIVE/CLOSED (+ result states), server-enforced closure | **FAIL** | Hardcoded, no server enforcement | Move to competitions.state, enforce server-side block on transaction creation when CLOSED |
| **Countdown** | Hardcoded `votingEnd: "2026-10-24"` in config.ts | DB-driven start date/time, homepage countdown uses DB | **FAIL** | Hardcoded | Store in competitions.voting_start/end, fetch |
| **Results** | No provisional/final logic, hardcoded | Provisional (online only) + Final (online+offline), admin controls SHOW_PROVISIONAL/SHOW_FINAL | **MISSING** | No result logic | Add competitions.show_provisional/show_final, create result logic + podium |
| **Podium** | Mock podium in klasemen, not DB | Premium ceremonial podium SMP/SMA 1st/2nd/3rd with logo+number, real ranking | **PARTIAL** | Mock, not DB | Make podium use real ranking view, ensure # number vs rank distinction |
| **Share** | Mock buttons, no QR, same URL | Two flows: BAGIKAN PROFIL (/tim/[slug]) and BAGIKAN DUKUNGAN (/dukung/[slug]), copy+QR+native share, QR encodes route | **PARTIAL** | No QR, same URL | Implement distinct URLs, QR via qrcode lib, share logic |
| **QR** | No QR | QR encodes actual route for profile/support | **MISSING** | No QR | Add qrcode generation |
| **Sound** | No sound system | Configurable background, notification, success, announcement, TTS, user toggle | **MISSING** | No sound | Create sound settings table, UI, respect autoplay |
| **TTS** | No TTS | TTS for announcement | **MISSING** | No TTS | Part of sound |
| **WhatsApp** | Hardcoded `0812-3456-7890` in config.ts, no admin control | Floating button, admin config number/message/enabled, DB-driven | **FAIL** | Hardcoded | Move to competitions.settings, admin/whatsapp page, DB-driven |
| **About** | Hardcoded text in tentang/page.tsx, not CMS | CMS-driven title/content/logo/poster | **FAIL** | Hardcoded | Create about content in competitions or separate table, admin/content editor |
| **Sponsors** | Hardcoded `src/lib/data.ts` sponsors, not DB | DB-driven, CRUD active/order/logo/link | **FAIL** | Hardcoded | Make sponsors table driven, admin/sponsor CRUD, frontend fetch |
| **Media** | Hardcoded Unsplash URLs in components, team has multiple photos | DB-driven, one photo+one logo per team, sponsor logo, official assets via storage | **FAIL** | Hardcoded URLs | Use storage + DB references, optimize, handle missing |
| **Admin** | 16 routes but mock data, not DB, not operational | Full control panel Dashboard/Teams/Users/Transactions/Ballots/Offline/Ranking/Results/Event/Content/Sponsors/Media/WhatsApp/Sound/Settings/Audit | **PARTIAL** | Mock, not DB, missing offline recap, results, sound, whatsapp | Fix each admin page to be DB-driven, add missing modules |
| **Security** | No server validation, client trusts price/quantity | Server validates price/quantity/payment, admin server-enforced | **FAIL** | Client can manipulate price | Add server validation in API, RLS, policies |
| **RLS** | Only one policy for peletons, others open, no indexes | Proper RLS for all tables, policies for public vs admin, indexes on ranking | **FAIL** | Incomplete RLS, missing indexes | Add RLS, indexes (category, verified, display_order) |
| **API** | No API routes (src/app/api missing) | All endpoints with auth, validation, DB, idempotency | **FAIL** | No API | Create API routes |
| **Responsive UI** | Desktop squeezed, but mobile bottom nav exists | Mobile-first 360/390/430, no overflow, intentional mobile | **PARTIAL** | Some tables overflow on mobile, admin not fully mobile | Fix tables → cards on mobile, test 320-1440 |
| **Dark Theme** | Dark implemented via AppProvider, but light is inverted | Dark default premium, light proper designed | **PASS** | Light works but needs polish | Polish light (warm white, not inverted) |
| **Light Theme** | Exists but needs design | Proper light theme | **PARTIAL** | Light is okay but not premium | Refine light tokens |
| **Animation** | Basic transitions, no excessive | Smooth subtle premium, prefers-reduced-motion | **PASS** | Okay, but needs refinement | Ensure reduced-motion, subtle |
| **Accessibility** | Basic focus, but missing labels, keyboard | Full a11y | **PARTIAL** | Missing aria for share, QR | Add aria, keyboard, contrast |
| **SEO** | Basic metadata in layout, not per-team DB | Per-team dynamic metadata from DB | **PARTIAL** | Hardcoded OG | Make dynamic |
| **Performance** | Client-heavy, no server fetch | Server fetch where appropriate, optimized images | **PARTIAL** | Many client components, unoptimized images | Move to server components, use next/image |

**Summary:** 4 PASS, 10 PARTIAL, 18 FAIL, 3 MISSING → ~70% visual but system FAIL per spec.

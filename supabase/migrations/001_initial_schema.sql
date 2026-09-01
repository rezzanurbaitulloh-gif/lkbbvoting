-- LKBB Peleton Terfavorit — Supabase / PostgreSQL schema
-- Spec §78-79: structure for replacement of demo data layer

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Users (extends auth.users via profiles)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  public_name text,
  role text not null default 'USER' check (role in ('USER','PARTICIPANT','ADMIN','SUPER_ADMIN')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Peletons
create table public.peletons (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  number text not null,
  name text not null,
  school text not null,
  city text not null,
  province text not null,
  category text not null check (category in ('SMP','SMA')),
  description text,
  image_url text,
  cover_url text,
  status text not null default 'Pending' check (status in ('Draft','Pending','Verified','Rejected','Suspended')),
  verified boolean not null default false,
  support_count int not null default 0, -- materialized, only increment on valid transaction
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Members
create table public.peleton_members (
  id uuid primary key default uuid_generate_v4(),
  peleton_id uuid not null references public.peletons(id) on delete cascade,
  name text not null,
  role text not null check (role in ('Danton','Danru','Anggota')),
  photo_url text,
  sort_order int not null default 0
);

-- Gallery
create table public.peleton_gallery (
  id uuid primary key default uuid_generate_v4(),
  peleton_id uuid not null references public.peletons(id) on delete cascade,
  url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- Supports (immutable ledger — only inserted after payment success)
create table public.supports (
  id uuid primary key default uuid_generate_v4(),
  peleton_id uuid not null references public.peletons(id) on delete cascade,
  user_id uuid references public.profiles(id),
  transaction_id uuid not null,
  amount int not null,
  supports int not null,
  created_at timestamptz default now()
);

-- Transactions
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  peleton_id uuid not null references public.peletons(id),
  amount int not null,
  supports int not null,
  method text not null,
  status text not null check (status in ('Pending','Success','Failed','Expired')),
  provider text not null default 'XENDIT',
  provider_ref text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Competition config
create table public.competitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tagline text,
  state text not null default 'NOT_STARTED' check (state in ('NOT_STARTED','REGISTRATION','VERIFICATION','VOTING_OPEN','VOTING_CLOSED','RESULT_VERIFICATION','RESULT_PUBLISHED','COMPLETED')),
  voting_start timestamptz,
  voting_end timestamptz,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Judges, Sponsors, News, Announcements, FAQ, Timeline, Audit Log, Notifications...
create table public.judges (id uuid primary key default uuid_generate_v4(), name text not null, role text, bio text, photo_url text, sort_order int default 0);
create table public.sponsors (id uuid primary key default uuid_generate_v4(), name text not null, tier text not null, logo_url text, url text, sort_order int default 0);
create table public.news (id uuid primary key default uuid_generate_v4(), slug text unique not null, title text not null, category text, excerpt text, content text, image_url text, author text, published boolean default false, created_at timestamptz default now());
create table public.announcements (id uuid primary key default uuid_generate_v4(), title text not null, category text, content text, created_at timestamptz default now());
create table public.faqs (id uuid primary key default uuid_generate_v4(), category text, question text not null, answer text not null, sort_order int default 0);
create table public.timeline_stages (id uuid primary key default uuid_generate_v4(), title text not null, date text, description text, status text, sort_order int default 0);
create table public.audit_logs (id uuid primary key default uuid_generate_v4(), user_id uuid, action text not null, target text, details jsonb, created_at timestamptz default now());
create table public.notifications (id uuid primary key default uuid_generate_v4(), user_id uuid references public.profiles(id), title text not null, body text, read boolean default false, created_at timestamptz default now());

-- RLS (enable, policies to be refined)
alter table public.profiles enable row level security;
alter table public.peletons enable row level security;
-- Public can read verified peletons
create policy "public can read verified peletons" on public.peletons for select using (verified = true);
-- Transaction trigger: only allow support increment via service role / RPC that checks transaction status

-- =============================================================================
-- PrepPilot initial schema: profiles + sessions, with Row Level Security.
-- Run this in the Supabase SQL Editor. Idempotent — safe to re-run.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, holding onboarding answers.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  role                  text,
  experience            text,
  interview_type        text,
  timeline              text,
  companies             text,
  concerns              text,
  onboarding_completed  boolean     not null default false,
  created_at            timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- sessions: one row per interview session.
-- items is a jsonb array of { order, category, question, answer, feedback }.
-- ----------------------------------------------------------------------------
create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  role            text,
  focus_override  jsonb,
  items           jsonb       not null default '[]'::jsonb,
  status          text        not null default 'in-progress'
                    check (status in ('in-progress', 'completed')),
  overall_score   integer,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

-- Supports per-user History queries and the "today's session count" rate-limit
-- check. DESC on created_at matches newest-first History ordering.
create index if not exists sessions_user_id_created_at_idx
  on public.sessions (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;

-- profiles: a user may read / insert / update only their own row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- sessions: a user may read / insert / update only their own rows.
drop policy if exists "sessions_select_own" on public.sessions;
create policy "sessions_select_own"
  on public.sessions for select
  using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.sessions;
create policy "sessions_insert_own"
  on public.sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.sessions;
create policy "sessions_update_own"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- OPTIONAL verification helper (safe to omit).
-- Lets the app confirm both tables exist AND RLS is enabled, via a single RPC
-- (`select * from public.schema_health()`), since PostgREST doesn't expose
-- pg_catalog directly. Read-only; returns only table names + a boolean.
-- ----------------------------------------------------------------------------
create or replace function public.schema_health()
returns table (table_name text, rls_enabled boolean)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select c.relname::text, c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('profiles', 'sessions');
$$;

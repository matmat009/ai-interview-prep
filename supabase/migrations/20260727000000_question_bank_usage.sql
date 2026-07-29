-- =============================================================================
-- Question Bank daily usage counter. Lightweight, per-user, per-UTC-day cap for
-- the stateless single-question practice mode — intentionally SEPARATE from the
-- sessions table and the "1 real session per day" system.
-- Run in the Supabase SQL Editor. Idempotent — safe to re-run.
-- =============================================================================

create table if not exists public.question_bank_usage (
  user_id uuid    not null references auth.users (id) on delete cascade,
  day     date    not null default (now() at time zone 'UTC')::date,
  count   integer not null default 0,
  primary key (user_id, day)
);

alter table public.question_bank_usage enable row level security;

-- A user may read only their own counter.
drop policy if exists "qbu_select_own" on public.question_bank_usage;
create policy "qbu_select_own" on public.question_bank_usage
  for select using (auth.uid() = user_id);

-- Atomic increment of today's counter; returns the new count. Writes go ONLY
-- through this (security definer) function, so the count can't be forged by a
-- direct table write from the client.
create or replace function public.increment_question_bank_usage()
returns integer
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  today date := (now() at time zone 'UTC')::date;
  new_count integer;
begin
  insert into public.question_bank_usage (user_id, day, count)
  values (auth.uid(), today, 1)
  on conflict (user_id, day)
  do update set count = public.question_bank_usage.count + 1
  returning count into new_count;
  return new_count;
end;
$$;

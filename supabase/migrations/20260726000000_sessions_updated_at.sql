-- =============================================================================
-- One action per day: track last activity on a session so that CONTINUING an
-- existing session (not just creating one) counts against the daily allowance.
-- Run in the Supabase SQL Editor. Idempotent — safe to re-run.
-- =============================================================================

alter table public.sessions
  add column if not exists updated_at timestamptz not null default now();

-- Backfill historical rows to their real last activity, so pre-existing
-- sessions don't all appear "acted on today" the moment this migration runs
-- (add-column default now() would otherwise stamp them all with the run time).
update public.sessions
  set updated_at = coalesce(completed_at, created_at);

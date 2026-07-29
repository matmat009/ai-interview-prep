-- =============================================================================
-- Cache the AI-generated Question Bank practice categories per user, so they're
-- generated once per role instead of on every visit. Nullable — null means
-- "not generated yet" (or role changed), which triggers regeneration.
-- Run in the Supabase SQL Editor. Idempotent — safe to re-run.
-- =============================================================================

alter table public.profiles
  add column if not exists question_bank_categories jsonb;

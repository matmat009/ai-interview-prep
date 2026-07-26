-- =============================================================================
-- Allow users to DELETE only their own sessions. The initial schema created
-- select/insert/update policies but no delete policy, so deletes were blocked
-- by RLS entirely. Run in the Supabase SQL Editor. Idempotent — safe to re-run.
-- =============================================================================

drop policy if exists "sessions_delete_own" on public.sessions;
create policy "sessions_delete_own"
  on public.sessions for delete
  using (auth.uid() = user_id);

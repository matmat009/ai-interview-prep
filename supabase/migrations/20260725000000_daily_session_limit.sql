-- =============================================================================
-- Server-side daily session limit: at most 1 new session per user per UTC day.
-- Backstop for the client-side checks. Run in the Supabase SQL Editor.
-- Idempotent — safe to re-run.
-- =============================================================================

create or replace function public.enforce_daily_session_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  new_day date := (coalesce(NEW.created_at, now()) at time zone 'UTC')::date;
  existing integer;
begin
  -- Count this user's sessions already created on the same UTC calendar day.
  select count(*) into existing
  from public.sessions
  where user_id = NEW.user_id
    and (created_at at time zone 'UTC')::date = new_day;

  if existing >= 1 then
    raise exception
      'Daily session limit reached: only one interview session per day is allowed.'
      using errcode = 'check_violation';
  end if;

  return NEW;
end;
$$;

drop trigger if exists sessions_daily_limit on public.sessions;
create trigger sessions_daily_limit
  before insert on public.sessions
  for each row
  execute function public.enforce_daily_session_limit();

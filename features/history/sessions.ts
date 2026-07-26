// Data layer for persisted interview sessions (Supabase `sessions` table).
// Replaces the previous in-memory dummy data.

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Feedback,
  QuestionCategory,
  SessionFocusOverride,
} from "@/types/interview";

// One answered question stored in sessions.items (jsonb array).
export type SessionItem = {
  order: number;
  category: QuestionCategory;
  question: string;
  answer: string;
  feedback: Feedback;
};

// Raw row shape from the sessions table.
export type SessionRow = {
  id: string;
  user_id: string;
  role: string | null;
  focus_override: SessionFocusOverride | null;
  items: SessionItem[] | null;
  status: "in-progress" | "completed";
  overall_score: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

// Display shape used by the History cards / list.
export type SessionStatus = "Completed" | "In Progress";

export type Session = {
  id: string;
  role: string;
  focus: string;
  date: string; // ISO timestamp
  score: number | null;
  status: SessionStatus;
};

// Mean of the per-question feedback scores — the session's overall score.
// Used both for what's shown on screen and what's persisted, so they can't drift.
export function averageScore(items: SessionItem[]): number | null {
  const scores = items
    .map((i) => i.feedback?.score)
    .filter((s): s is number => typeof s === "number");
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function toDisplaySession(row: SessionRow): Session {
  const focus =
    row.focus_override?.specificTopic?.trim() ||
    row.focus_override?.interviewType?.trim() ||
    "General practice";

  return {
    id: row.id,
    role: row.role?.trim() || "Interview",
    focus,
    date: row.created_at,
    score: row.overall_score,
    status: row.status === "completed" ? "Completed" : "In Progress",
  };
}

export async function fetchSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SessionRow[];
}

// RLS restricts this to the caller's own sessions, so a missing/foreign id
// simply comes back null.
export async function fetchSession(
  supabase: SupabaseClient,
  id: string,
): Promise<SessionRow | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SessionRow) ?? null;
}

// Start of the current UTC calendar day, as ISO — matches the DB daily-limit
// trigger, which counts by UTC day.
function startOfUtcTodayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

// One action per day = starting a NEW session or CONTINUING an existing one.
// True if any of the user's sessions was created or last updated today (UTC).
export async function hasUsedTodaysAction(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const since = startOfUtcTodayIso();
  const { data, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .or(`created_at.gte.${since},updated_at.gte.${since}`)
    .limit(1);
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

// The user's most recent unfinished session (any date), or null. This is what
// "Continue where you left off" resumes.
export async function fetchInProgressSession(
  supabase: SupabaseClient,
  userId: string,
): Promise<SessionRow | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "in-progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SessionRow) ?? null;
}

// RLS's sessions_delete_own policy restricts this to the caller's own rows.
export async function deleteSession(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

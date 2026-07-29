import type { SupabaseClient } from "@supabase/supabase-js";

// Daily cap for the stateless Question Bank practice mode. Separate from the
// "1 real session per day" system — this just prevents an unlimited Gemini loop.
export const QUESTION_BANK_DAILY_LIMIT = 5;

function utcToday(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

// How many Question Bank questions the user has generated today (UTC).
export async function fetchQuestionBankUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("question_bank_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("day", utcToday())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.count ?? 0;
}

// Atomically bump today's counter (via a security-definer RPC); returns the new
// count so the caller can update its remaining budget.
export async function consumeQuestionBankUsage(
  supabase: SupabaseClient,
): Promise<number> {
  const { data, error } = await supabase.rpc("increment_question_bank_usage");
  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}

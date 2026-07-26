import type { SessionItem } from "@/features/history/sessions";

export type ResumeState = {
  questions: string[]; // answered question text, indexed by order-1
  answers: string[]; // answered answer text, indexed by order-1
  items: SessionItem[];
  currentIndex: number; // next question to work on (0-based)
  finished: boolean; // every question already answered
};

// Rebuild the in-session UI state from whatever was persisted on the row, so a
// resumed session continues from the next unanswered question rather than
// restarting from Q1 (which would overwrite saved answers). Items are written
// in order during a session, so their count is the number answered.
export function deriveResumeState(
  items: SessionItem[] | null | undefined,
  total: number,
): ResumeState {
  const sorted = (items ?? []).slice().sort((a, b) => a.order - b.order);
  const questions: string[] = [];
  const answers: string[] = [];
  for (const it of sorted) {
    const idx = it.order - 1;
    questions[idx] = it.question;
    answers[idx] = it.answer;
  }
  const answered = sorted.length;
  const finished = answered >= total;
  return {
    questions,
    answers,
    items: sorted,
    currentIndex: finished ? total - 1 : answered,
    finished,
  };
}

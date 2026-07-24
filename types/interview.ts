// Shared data types for the onboarding + interview flows. These are the app's
// canonical shapes, derived from the data already in use across the codebase
// plus the finalized 7-question interview structure. Timestamps are ISO strings
// for easy serialization once persistence (Supabase) is wired up.

// Answers collected across the onboarding wizard. Every field is a plain string:
// picking "Other" replaces the option value with free text, so it stays a string.
export interface OnboardingAnswers {
  role: string;
  experience: string;
  interviewType: string;
  timeline: string;
  companies: string;
  concerns: string;
}

// The role a question plays in the 7-question flow:
// Q1 warmup · Q2–Q4 role-specific · Q5–Q6 general · Q7 wildcard/closing.
export type QuestionCategory =
  | "warmup"
  | "role-specific"
  | "general"
  | "wildcard";

export interface InterviewQuestion {
  id: string;
  text: string;
  order: number; // 1–7
  category: QuestionCategory;
}

// Per-session override from the Adjust Focus modal — tweaks the role-specific
// questions (Q2–4) for this session only, without touching onboarding data.
export interface SessionFocusOverride {
  interviewType?: string;
  specificTopic?: string;
}

export interface UserAnswer {
  questionId: string;
  text: string;
  submittedAt: string; // ISO timestamp
}

export interface Feedback {
  strengths: string[];
  improvements: string[];
  summary: string;
  score?: number;
}

export interface InterviewSession {
  id: string;
  userId?: string | null; // nullable — no auth yet
  role: string;
  focusOverride?: SessionFocusOverride;
  questions: InterviewQuestion[];
  answers: UserAnswer[];
  feedback: Feedback[];
  status: "in-progress" | "completed";
  overallScore?: number;
  createdAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

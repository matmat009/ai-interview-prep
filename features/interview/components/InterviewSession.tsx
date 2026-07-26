"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  averageScore,
  fetchSession,
  type SessionItem,
} from "@/features/history/sessions";
import { pickConcernIndices } from "@/features/interview/concern-plan";
import { deriveResumeState } from "@/features/interview/resume";
import type {
  Feedback,
  InterviewQuestion,
  OnboardingAnswers,
  SessionFocusOverride,
} from "@/types/interview";
import { AnswerInput } from "@/features/interview/components/AnswerInput";
import { FeedbackLoading } from "@/features/interview/components/FeedbackLoading";
import { FeedbackPanel } from "@/features/interview/components/FeedbackPanel";
import { LeaveGuard } from "@/features/interview/components/LeaveGuard";
import { QuestionCard } from "@/features/interview/components/QuestionCard";
import { SessionSummary } from "@/features/interview/components/SessionSummary";

// Fixed 7-question plan (category/order). The text is generated just-in-time per
// session: Q1 warm-up, Q2–Q4 role-specific, Q5–Q6 general, Q7 wildcard.
const QUESTION_PLAN: Omit<InterviewQuestion, "text">[] = [
  { id: "q1", order: 1, category: "warmup" },
  { id: "q2", order: 2, category: "role-specific" },
  { id: "q3", order: 3, category: "role-specific" },
  { id: "q4", order: 4, category: "role-specific" },
  { id: "q5", order: 5, category: "general" },
  { id: "q6", order: 6, category: "general" },
  { id: "q7", order: 7, category: "wildcard" },
];
const TOTAL = QUESTION_PLAN.length;

const QUESTION_STATUSES = [
  "Preparing your next question...",
  "Tailoring it to your focus...",
  "Almost ready...",
];

type Phase =
  | "loadingQuestion"
  | "answering"
  | "loadingFeedback"
  | "feedback"
  | "error";

type SessionError = { kind: "question" | "feedback"; message: string };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
  return res.json() as Promise<T>;
}

// Replace an item with the same order (e.g. after a feedback retry) or append.
function upsertItem(list: SessionItem[], item: SessionItem): SessionItem[] {
  const index = list.findIndex((i) => i.order === item.order);
  if (index === -1) return [...list, item];
  const next = [...list];
  next[index] = item;
  return next;
}

export function InterviewSession({
  sessionId,
  focusOverride,
}: {
  sessionId: string;
  focusOverride?: SessionFocusOverride;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingAnswers | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState<SessionItem[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [phase, setPhase] = useState<Phase>("loadingQuestion");
  const [error, setError] = useState<SessionError | null>(null);
  const [finished, setFinished] = useState(false);

  // Highest question index we've already kicked off generation for (guards
  // against duplicate requests, incl. React StrictMode's double-invoke in dev).
  const requestedRef = useRef(-1);
  // Answered items so far — source of truth for what we persist.
  const itemsRef = useRef<SessionItem[]>([]);
  // Which question indices target the candidate's stated concern (chosen once).
  const concernIndicesRef = useRef<Set<number>>(new Set());

  // Persist the answered items to the session row. Failures are logged but
  // don't interrupt the interview; the completion write re-sends items anyway.
  async function persistItems(items: SessionItem[]) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("sessions")
        .update({ items, updated_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) console.error("Failed to save session items:", error.message);
    } catch (e) {
      console.error("Failed to save session items:", e);
    }
  }

  async function completeSession() {
    const items = itemsRef.current;
    // Same helper the summary screen uses, so the stored score can't drift.
    const overallScore = averageScore(items);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("sessions")
        .update({
          items,
          status: "completed",
          overall_score: overallScore,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
      if (error) console.error("Failed to complete session:", error.message);
    } catch (e) {
      console.error("Failed to complete session:", e);
    }
  }

  const isLast = currentIndex === TOTAL - 1;
  const questionText = questions[currentIndex];

  // Load the signed-in user's profile and any saved progress for this session.
  // Questions/feedback are tailored to the profile; a session with saved items
  // resumes at the next unanswered question instead of restarting.
  // Defensive: bounce to onboarding if there's no completed profile.
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const [{ data }, sessionRow] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        fetchSession(supabase, sessionId),
      ]);
      if (!active) return;
      if (!data || !data.onboarding_completed) {
        router.replace("/onboarding");
        return;
      }
      // Completed sessions are read-only — send them to the review page.
      if (sessionRow?.status === "completed") {
        router.replace(`/history/${sessionId}`);
        return;
      }

      // Restore whatever was answered so we continue from the next unanswered
      // question rather than restarting (which would overwrite saved answers).
      const resume = deriveResumeState(sessionRow?.items, TOTAL);
      itemsRef.current = resume.items;
      // Ensure the just-in-time generator fires for the resumed index and never
      // re-generates a question that was already answered.
      requestedRef.current = resume.currentIndex - 1;
      // Decide up front which questions address their stated concern (1-2).
      concernIndicesRef.current = new Set(
        data.concerns?.trim() ? pickConcernIndices(TOTAL) : [],
      );

      setQuestions(resume.questions);
      setAnswers(resume.answers);
      setItems(resume.items);
      setCurrentIndex(resume.currentIndex);
      if (resume.finished) {
        // Every question answered but the row was never marked complete (e.g. a
        // crash before the completion write) — finalize and show the summary.
        setFinished(true);
        void completeSession();
      }

      // Set profile LAST so the generator effect below sees the restored
      // currentIndex/finished when it first runs.
      setProfile({
        role: data.role ?? "",
        experience: data.experience ?? "",
        interviewType: data.interview_type ?? "",
        timeline: data.timeline ?? "",
        companies: data.companies ?? "",
        concerns: data.concerns ?? "",
      });
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, sessionId]);

  async function loadQuestion(index: number) {
    if (!profile) return;
    setError(null);
    setPhase("loadingQuestion");
    try {
      const { question } = await postJson<{ question: string }>(
        "/api/generate-question",
        {
          category: QUESTION_PLAN[index].category,
          onboarding: profile,
          focusOverride,
          previousQuestions: questions.filter(Boolean),
          weightToConcern: concernIndicesRef.current.has(index),
        },
      );
      setQuestions((prev) => {
        const next = [...prev];
        next[index] = question;
        return next;
      });
      setPhase("answering");
    } catch (e) {
      setError({
        kind: "question",
        message: e instanceof Error ? e.message : String(e),
      });
      setPhase("error");
    }
  }

  async function loadFeedback(answer: string) {
    if (!profile) return;
    setError(null);
    setPhase("loadingFeedback");
    try {
      const result = await postJson<Feedback>("/api/generate-feedback", {
        question: questions[currentIndex],
        answer,
        category: QUESTION_PLAN[currentIndex].category,
        onboarding: profile,
      });
      setFeedback(result);
      setPhase("feedback");

      // Persist this answered question to the session row.
      itemsRef.current = upsertItem(itemsRef.current, {
        order: QUESTION_PLAN[currentIndex].order,
        category: QUESTION_PLAN[currentIndex].category,
        question: questions[currentIndex],
        answer,
        feedback: result,
      });
      setItems(itemsRef.current);
      void persistItems(itemsRef.current);
    } catch (e) {
      setError({
        kind: "feedback",
        message: e instanceof Error ? e.message : String(e),
      });
      setPhase("error");
    }
  }

  // Generate each question just-in-time the first time we reach its index.
  // Waits for the profile so questions are tailored to the real user.
  useEffect(() => {
    if (!profile) return;
    if (finished) return;
    if (requestedRef.current >= currentIndex) return;
    requestedRef.current = currentIndex;
    void loadQuestion(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, currentIndex, finished]);

  function handleSubmit() {
    const answer = draft;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answer;
      return next;
    });
    void loadFeedback(answer);
  }

  function handleNext() {
    if (isLast) {
      setFinished(true);
      void completeSession();
      return;
    }
    setFeedback(null);
    setDraft("");
    setPhase("loadingQuestion");
    setCurrentIndex((index) => index + 1);
  }

  function handleRetry() {
    if (!error) return;
    if (error.kind === "question") {
      void loadQuestion(currentIndex);
    } else {
      void loadFeedback(answers[currentIndex] ?? "");
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
      {/* Warn before leaving while the session is still in progress. */}
      <LeaveGuard active={!finished} />

      <div className="my-auto flex w-full max-w-2xl flex-col gap-5">
        {finished ? (
          <SessionSummary items={items} overallScore={averageScore(items)} />
        ) : (
          <>
            {questionText && phase !== "loadingQuestion" && (
              <QuestionCard
                index={currentIndex}
                total={TOTAL}
                question={questionText}
              />
            )}

            {phase === "loadingQuestion" && (
              <FeedbackLoading statuses={QUESTION_STATUSES} />
            )}
            {phase === "answering" && (
              <AnswerInput
                value={draft}
                onChange={setDraft}
                onSubmit={handleSubmit}
              />
            )}
            {phase === "loadingFeedback" && <FeedbackLoading />}
            {phase === "feedback" && feedback && (
              <FeedbackPanel
                feedback={feedback}
                answer={answers[currentIndex] ?? ""}
                isLast={isLast}
                onNext={handleNext}
              />
            )}
            {phase === "error" && error && (
              <ErrorCard message={error.message} onRetry={handleRetry} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="flex min-h-40 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" />
        </div>
        <div>
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw />
          Try again
        </Button>
      </div>
    </div>
  );
}

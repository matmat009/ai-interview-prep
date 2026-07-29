"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Feedback, OnboardingAnswers } from "@/types/interview";
import { AnswerInput } from "@/features/interview/components/AnswerInput";
import { FeedbackLoading } from "@/features/interview/components/FeedbackLoading";
import { FeedbackPanel } from "@/features/interview/components/FeedbackPanel";

const QUESTION_STATUSES = [
  "Preparing your question...",
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

// Stateless single-question practice for one category. Reuses the interview
// flow's API routes and UI, but never writes to the sessions table.
export function QuestionBankSession({
  category,
  profile,
  remaining,
  onConsume,
  onExit,
}: {
  category: string;
  profile: OnboardingAnswers;
  remaining: number;
  onConsume: () => Promise<void>;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("loadingQuestion");
  const [question, setQuestion] = useState("");
  const [draft, setDraft] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<SessionError | null>(null);
  // Questions asked this run, so "Try another" doesn't repeat them.
  const askedRef = useRef<string[]>([]);
  const didInit = useRef(false);

  async function loadQuestion() {
    setError(null);
    setDraft("");
    setAnswer("");
    setFeedback(null);
    setPhase("loadingQuestion");
    try {
      const { question: q } = await postJson<{ question: string }>(
        "/api/generate-question",
        {
          // A specific interview type is generated via the role-specific branch
          // with a focus override — the same mechanism as Adjust Focus.
          category: "role-specific",
          onboarding: profile,
          focusOverride: { interviewType: category },
          previousQuestions: askedRef.current,
        },
      );
      askedRef.current = [...askedRef.current, q];
      setQuestion(q);
      // Count this generated question against the daily cap.
      await onConsume();
      setPhase("answering");
    } catch (e) {
      setError({
        kind: "question",
        message: e instanceof Error ? e.message : String(e),
      });
      setPhase("error");
    }
  }

  async function loadFeedback(ans: string) {
    setError(null);
    setPhase("loadingFeedback");
    try {
      const result = await postJson<Feedback>("/api/generate-feedback", {
        question,
        answer: ans,
        category: "role-specific",
        onboarding: profile,
      });
      setFeedback(result);
      setPhase("feedback");
    } catch (e) {
      setError({
        kind: "feedback",
        message: e instanceof Error ? e.message : String(e),
      });
      setPhase("error");
    }
  }

  // Generate the first question once on mount (guarded against StrictMode's
  // double-invoke so it isn't counted twice).
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit() {
    setAnswer(draft);
    void loadFeedback(draft);
  }

  function handleRetry() {
    if (!error) return;
    if (error.kind === "question") void loadQuestion();
    else void loadFeedback(answer);
  }

  const outOfQuestions = remaining <= 0;

  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
      <div className="my-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-primary">
            {category} · Practice question
          </span>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Categories
          </button>
        </div>

        {/* Question card — QuestionCard's glass style without the progress framing. */}
        {question && phase !== "loadingQuestion" && (
          <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <h1 className="text-xl leading-snug font-semibold tracking-tight text-balance sm:text-2xl">
              {question}
            </h1>
          </div>
        )}

        {phase === "loadingQuestion" && (
          <FeedbackLoading statuses={QUESTION_STATUSES} />
        )}
        {phase === "answering" && (
          <AnswerInput value={draft} onChange={setDraft} onSubmit={handleSubmit} />
        )}
        {phase === "loadingFeedback" && <FeedbackLoading />}
        {phase === "feedback" && feedback && (
          <FeedbackPanel
            feedback={feedback}
            answer={answer}
            actions={
              <>
                <Button variant="outline" onClick={onExit}>
                  Choose a different category
                </Button>
                {outOfQuestions ? (
                  <span className="self-center text-xs text-muted-foreground">
                    You&apos;ve used today&apos;s practice questions.
                  </span>
                ) : (
                  <Button
                    onClick={() => void loadQuestion()}
                    className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
                  >
                    <RotateCcw />
                    Try another question
                  </Button>
                )}
              </>
            }
          />
        )}
        {phase === "error" && error && (
          <ErrorCard message={error.message} onRetry={handleRetry} />
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
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw />
          Try again
        </Button>
      </div>
    </div>
  );
}

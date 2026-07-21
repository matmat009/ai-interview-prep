"use client";

import { use, useState } from "react";

import { AnswerInput } from "@/features/interview/components/AnswerInput";
import { FeedbackLoading } from "@/features/interview/components/FeedbackLoading";
import { FeedbackPanel } from "@/features/interview/components/FeedbackPanel";
import { LeaveGuard } from "@/features/interview/components/LeaveGuard";
import { QuestionCard } from "@/features/interview/components/QuestionCard";
import { SessionSummary } from "@/features/interview/components/SessionSummary";

// Dummy question set for the dummy role/focus (Frontend Engineer · System Design).
// Q1 warm-up; Q2–Q4 role/technical; Q5 career goals; Q6 compensation; Q7 closing.
// Replaced with real data (keyed off the session + onboarding answers) later.
const QUESTIONS = [
  "To warm up — tell me about yourself and what draws you to frontend engineering.",
  "Walk me through how you'd design the component architecture for a large, data-heavy dashboard.",
  "How would you design a scalable client-side data layer — caching, syncing, and keeping the UI consistent as data updates?",
  "A key page is rendering slowly as data grows. How would you diagnose and improve its performance?",
  "Where do you see yourself in your career over the next few years?",
  "What are your salary expectations for this role?",
  "What's a weakness you're actively working to improve?",
];

// Placeholder for the real feedback call. Swap the body for the Gemini request
// (e.g. `return await fetchFeedback(question, answer)`); the caller already
// awaits it, so the loading state and flow stay unchanged.
function generateFeedback(_question: string, _answer: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1700));
}

type Phase = "answering" | "loading" | "feedback";

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  // sessionId is unwrapped for routing/data flow; not surfaced in the UI yet.
  const { sessionId } = use(params);
  void sessionId;

  const total = QUESTIONS.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() =>
    Array(total).fill(""),
  );
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [finished, setFinished] = useState(false);

  const isLast = currentIndex === total - 1;

  async function handleSubmit() {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = draft;
      return next;
    });

    // Show the "thinking" state, then reveal feedback once it's ready.
    setPhase("loading");
    await generateFeedback(QUESTIONS[currentIndex], draft);
    setPhase("feedback");
  }

  function handleNext() {
    if (isLast) {
      // Show the session summary before leaving the flow.
      setFinished(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setDraft("");
    setPhase("answering");
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
      {/* Warn before leaving while the session is still in progress. */}
      <LeaveGuard active={!finished} />

      <div className="my-auto flex w-full max-w-2xl flex-col gap-5">
        {finished ? (
          <SessionSummary questions={QUESTIONS} />
        ) : (
          <>
            <QuestionCard
              index={currentIndex}
              total={total}
              question={QUESTIONS[currentIndex]}
            />

            {phase === "loading" ? (
              <FeedbackLoading />
            ) : phase === "feedback" ? (
              <FeedbackPanel
                answer={answers[currentIndex]}
                isLast={isLast}
                onNext={handleNext}
              />
            ) : (
              <AnswerInput
                value={draft}
                onChange={setDraft}
                onSubmit={handleSubmit}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

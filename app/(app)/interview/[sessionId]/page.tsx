"use client";

import { use, useState } from "react";

import { useRouter } from "next/navigation";

import { AnswerInput } from "@/features/interview/components/AnswerInput";
import { FeedbackPanel } from "@/features/interview/components/FeedbackPanel";
import { QuestionCard } from "@/features/interview/components/QuestionCard";

// Dummy question set for the dummy role/focus (Frontend Engineer · System Design).
// Q1 is a warm-up; Q2–5 get progressively more specific. Replaced with real data
// (keyed off the session + onboarding answers) in a later step.
const QUESTIONS = [
  "To warm up — tell me about yourself and what draws you to frontend engineering.",
  "Walk me through how you'd design the component architecture for a large, data-heavy dashboard.",
  "How do you approach state management in a complex React app, and when would you reach for a global store versus local state?",
  "A key page is rendering slowly as data grows. How would you diagnose and improve its performance?",
  "Describe a challenging technical trade-off you made in a UI, and how you evaluated the options.",
];

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  // sessionId is unwrapped for routing/data flow; not surfaced in the UI yet.
  const { sessionId } = use(params);
  void sessionId;

  const router = useRouter();

  const total = QUESTIONS.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() =>
    Array(total).fill(""),
  );
  const [draft, setDraft] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const isLast = currentIndex === total - 1;

  function handleSubmit() {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = draft;
      return next;
    });
    setShowFeedback(true);
  }

  function handleNext() {
    if (isLast) {
      // No session persistence yet — return to history.
      router.push("/history");
      return;
    }
    setCurrentIndex((index) => index + 1);
    setDraft("");
    setShowFeedback(false);
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
      <div className="my-auto flex w-full max-w-2xl flex-col gap-5">
        <QuestionCard
          index={currentIndex}
          total={total}
          question={QUESTIONS[currentIndex]}
        />

        {showFeedback ? (
          <FeedbackPanel
            answer={answers[currentIndex]}
            isLast={isLast}
            onNext={handleNext}
          />
        ) : (
          <AnswerInput value={draft} onChange={setDraft} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}

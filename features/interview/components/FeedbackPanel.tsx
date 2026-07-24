"use client";

import type { ComponentType } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Flag,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Feedback } from "@/types/interview";

export function FeedbackPanel({
  feedback,
  answer,
  isLast,
  onNext,
}: {
  feedback: Feedback;
  answer: string;
  isLast: boolean;
  onNext: () => void;
}) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium text-primary">Feedback</span>
        </div>
        {typeof feedback.score === "number" && (
          <span className="text-sm font-semibold tabular-nums">
            {feedback.score}%
          </span>
        )}
      </div>

      {/* The user's submitted answer, for context alongside the feedback. */}
      {answer.trim() && (
        <div className="mt-4 rounded-lg border border-white/5 bg-background/40 p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Your answer
          </p>
          <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
            {answer}
          </p>
        </div>
      )}

      <p className="mt-5 text-base leading-relaxed text-foreground">
        {feedback.summary}
      </p>

      <div className="mt-6 space-y-5">
        {feedback.strengths.length > 0 && (
          <FeedbackSection
            icon={CheckCircle2}
            tone="positive"
            title="Strengths"
            items={feedback.strengths}
          />
        )}
        {feedback.improvements.length > 0 && (
          <FeedbackSection
            icon={TrendingUp}
            tone="accent"
            title="Areas to improve"
            items={feedback.improvements}
          />
        )}
      </div>

      <div className="mt-7 flex justify-end">
        <Button
          onClick={onNext}
          className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
        >
          {isLast ? "Finish Session" : "Next Question"}
          {isLast ? <Flag /> : <ArrowRight />}
        </Button>
      </div>
    </div>
  );
}

function FeedbackSection({
  icon: Icon,
  tone,
  title,
  items,
}: {
  icon: ComponentType<{ className?: string }>;
  tone: "positive" | "accent";
  title: string;
  items: string[];
}) {
  const isPositive = tone === "positive";
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={`flex size-7 items-center justify-center rounded-md ${
            isPositive
              ? "bg-emerald-400/10 text-emerald-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-4" />
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2.5 pl-9 text-sm leading-relaxed text-muted-foreground"
          >
            <span
              className={`mt-2 size-1.5 shrink-0 rounded-full ${
                isPositive ? "bg-emerald-400" : "bg-primary"
              }`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

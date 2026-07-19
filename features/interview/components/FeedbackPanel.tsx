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

// Dummy feedback, shaped the way real AI feedback will be (distinct sections
// rather than one paragraph). Swapped for model output in a later step.
const SUMMARY =
  "Solid answer overall — you communicated clearly and stayed on topic. A few tweaks would take it from good to great.";

const STRENGTHS = [
  "Clear structure — you set up context before walking through your reasoning.",
  "Grounded your points with concrete, believable examples.",
];

const IMPROVEMENTS = [
  "Add specific metrics (e.g. load time, bundle size) to quantify the impact.",
  "Tie the answer back to the trade-offs and why you chose your approach.",
];

export function FeedbackPanel({
  answer,
  isLast,
  onNext,
}: {
  answer: string;
  isLast: boolean;
  onNext: () => void;
}) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <span className="text-sm font-medium text-primary">Feedback</span>
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

      <p className="mt-5 text-base leading-relaxed text-foreground">{SUMMARY}</p>

      <div className="mt-6 space-y-5">
        <FeedbackSection
          icon={CheckCircle2}
          tone="positive"
          title="Strengths"
          items={STRENGTHS}
        />
        <FeedbackSection
          icon={TrendingUp}
          tone="accent"
          title="Areas to improve"
          items={IMPROVEMENTS}
        />
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

"use client";

import { useState } from "react";
import type { ComponentType } from "react";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  History,
  RotateCcw,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";

// Dummy aggregated results — replaced with real scoring once feedback is wired.
const OVERALL_SCORE = 82;
const OVERALL_LABEL = "Solid performance";

const SCORES = [78, 85, 80, 84, 82, 79, 83];
const TAKEAWAYS = [
  "Warm, clear intro — tighten the pitch to about 60 seconds.",
  "Strong architecture reasoning; name the specific patterns you'd use.",
  "Good scalability instincts; be explicit about the caching trade-offs.",
  "Solid debugging steps; quantify the performance win.",
  "Genuine motivation; tie your goals back to this role's growth path.",
  "Reasonable range; anchor it to market data and the value you bring.",
  "Honest and self-aware; pair the weakness with concrete progress.",
];

const STRENGTHS = [
  "You structure answers well — context first, then reasoning.",
  "You back your claims with concrete, believable examples.",
  "You stay calm and on-topic on open-ended prompts.",
];

const IMPROVEMENTS = [
  "Quantify impact with specific metrics wherever you can.",
  "Call out trade-offs explicitly and why you chose your path.",
  "Tighten longer answers — lead with the headline.",
];

export function SessionSummary({ questions }: { questions: string[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Score header */}
      <div className="rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 shadow-lg shadow-primary/30 ring-1 ring-white/15">
          <Trophy className="size-7 text-white" strokeWidth={1.75} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Session complete</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">
          {OVERALL_SCORE}%
        </p>
        <p className="mt-1 text-sm font-medium text-primary">{OVERALL_LABEL}</p>
      </div>

      {/* Question recap — collapsed by default, expand for the takeaway */}
      <div className="rounded-2xl border border-white/10 bg-card/60 p-2 shadow-2xl backdrop-blur-xl">
        <div className="px-3 py-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Question recap
          </span>
        </div>
        <ul>
          {questions.map((question, i) => {
            const open = expanded === i;
            return (
              <li
                key={i}
                className="border-b border-white/5 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  <span
                    className={`flex-1 text-sm ${open ? "" : "truncate"}`}
                  >
                    {question}
                  </span>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                    {SCORES[i]}%
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <p className="pr-3 pb-3 pl-12 text-sm leading-relaxed text-muted-foreground">
                    {TAKEAWAYS[i]}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Aggregated strengths + improvements */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          icon={CheckCircle2}
          tone="positive"
          title="Key strengths"
          items={STRENGTHS}
        />
        <SummaryCard
          icon={TrendingUp}
          tone="accent"
          title="Key areas to improve"
          items={IMPROVEMENTS}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/history")}
          className="sm:w-auto"
        >
          <History />
          View in History
        </Button>
        <Button
          onClick={() => router.push("/interview")}
          className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 sm:w-auto"
        >
          <RotateCcw />
          Practice Again
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({
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
    <div className="rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl">
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
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
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

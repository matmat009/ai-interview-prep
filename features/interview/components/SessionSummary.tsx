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
import type { SessionItem } from "@/features/history/sessions";

function scoreLabel(score: number | null): string {
  if (score === null) return "Session complete";
  if (score >= 90) return "Excellent performance";
  if (score >= 80) return "Solid performance";
  if (score >= 70) return "Good, with room to grow";
  return "Keep practicing";
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  return list.filter((text) => {
    const key = text.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Strengths come from the best-answered questions, improvements from the
// weakest — so the aggregates reflect what actually went well / badly.
function topStrengths(items: SessionItem[], limit = 3): string[] {
  return dedupe(
    [...items]
      .sort((a, b) => (b.feedback?.score ?? 0) - (a.feedback?.score ?? 0))
      .flatMap((i) => i.feedback?.strengths ?? []),
  ).slice(0, limit);
}

function topImprovements(items: SessionItem[], limit = 3): string[] {
  return dedupe(
    [...items]
      .sort((a, b) => (a.feedback?.score ?? 0) - (b.feedback?.score ?? 0))
      .flatMap((i) => i.feedback?.improvements ?? []),
  ).slice(0, limit);
}

export function SessionSummary({
  items,
  overallScore,
}: {
  items: SessionItem[];
  overallScore: number | null;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  const ordered = [...items].sort((a, b) => a.order - b.order);
  const strengths = topStrengths(ordered);
  const improvements = topImprovements(ordered);

  return (
    <div className="flex flex-col gap-4">
      {/* Score header */}
      <div className="rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 shadow-lg shadow-primary/30 ring-1 ring-white/15">
          <Trophy className="size-7 text-white" strokeWidth={1.75} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Session complete</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">
          {overallScore !== null ? `${overallScore}%` : "—"}
        </p>
        <p className="mt-1 text-sm font-medium text-primary">
          {scoreLabel(overallScore)}
        </p>
      </div>

      {/* Question recap — collapsed by default, expand for the takeaway */}
      {ordered.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-card/60 p-2 shadow-2xl backdrop-blur-xl">
          <div className="px-3 py-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Question recap
            </span>
          </div>
          <ul>
            {ordered.map((item, i) => {
              const open = expanded === i;
              return (
                <li
                  key={item.order}
                  className="border-b border-white/5 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
                      {item.order}
                    </span>
                    <span className={`flex-1 text-sm ${open ? "" : "truncate"}`}>
                      {item.question}
                    </span>
                    {typeof item.feedback?.score === "number" && (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                        {item.feedback.score}%
                      </span>
                    )}
                    <ChevronDown
                      className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && item.feedback?.summary && (
                    <p className="pr-3 pb-3 pl-12 text-sm leading-relaxed text-muted-foreground">
                      {item.feedback.summary}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Aggregated strengths + improvements, derived from the real feedback */}
      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {strengths.length > 0 && (
            <SummaryCard
              icon={CheckCircle2}
              tone="positive"
              title="Key strengths"
              items={strengths}
            />
          )}
          {improvements.length > 0 && (
            <SummaryCard
              icon={TrendingUp}
              tone="accent"
              title="Key areas to improve"
              items={improvements}
            />
          )}
        </div>
      )}

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

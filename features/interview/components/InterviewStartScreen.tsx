"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  MessageSquare,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdjustFocusModal } from "@/features/interview/components/AdjustFocusModal";

export function InterviewStartScreen() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  // Per-session focus override (dummy onboarding defaults; not persisted yet).
  const [focusOpen, setFocusOpen] = useState(false);
  const [interviewType, setInterviewType] = useState("System Design");
  const [topic, setTopic] = useState("");

  const focusValue = topic ? `${interviewType} · ${topic}` : interviewType;

  const summary = [
    { icon: Briefcase, label: "Role", value: "Frontend Engineer" },
    { icon: TrendingUp, label: "Experience", value: "Mid-level" },
    { icon: Target, label: "Focus", value: focusValue },
  ];

  function handleStart() {
    setStarting(true);
    const sessionId = crypto.randomUUID();
    router.push(`/interview/${sessionId}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        {/* Illustration */}
        <div className="relative mb-9">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-full bg-primary/25 blur-2xl"
          />
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 shadow-lg shadow-primary/30 ring-1 ring-white/15">
            <Mic className="size-9 text-white" strokeWidth={1.75} />
          </div>
          <div className="absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-lg border border-white/10 bg-card/80 shadow-md backdrop-blur-md">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="absolute -bottom-3 -left-3 flex size-8 items-center justify-center rounded-lg border border-white/10 bg-card/80 shadow-md backdrop-blur-md">
            <MessageSquare className="size-4 text-fuchsia-400" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Ready to practice your interview?
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground text-balance">
          We&apos;ll tailor each question to your focus area. Take your time —
          you can pause whenever you need.
        </p>

        {/* Summary card — glass treatment for contrast over the gradient */}
        <div className="mt-9 w-full overflow-hidden rounded-2xl border border-white/10 bg-card/60 text-left shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-5 py-3">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Your session focus
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {summary.map((row) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <row.icon className="size-4" />
                </span>
                <span className="text-sm text-muted-foreground">
                  {row.label}
                </span>
                <span className="ml-auto text-right text-sm font-medium text-foreground">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-9 flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={starting}
            className="group w-full px-8 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 sm:w-auto"
          >
            {starting ? "Starting…" : "Start Interview"}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Button>
          <button
            type="button"
            onClick={() => setFocusOpen(true)}
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Adjust focus
          </button>
        </div>
      </div>

      <AdjustFocusModal
        open={focusOpen}
        onOpenChange={setFocusOpen}
        interviewType={interviewType}
        topic={topic}
        onSave={(nextType, nextTopic) => {
          setInterviewType(nextType);
          setTopic(nextTopic);
        }}
      />
    </div>
  );
}

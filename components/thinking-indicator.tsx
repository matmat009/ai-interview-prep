"use client";

import { useEffect, useState } from "react";

import { Sparkles } from "lucide-react";

// Shared "thinking" visual: a pulsing AI badge, cycling status text, and dots.
// No card wrapper — the caller provides its own container (see FeedbackLoading
// and the onboarding wizard) so it drops into either an existing card or a new
// glass card without nesting.
export function ThinkingIndicator({
  statuses,
  intervalMs = 900,
}: {
  statuses: string[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (statuses.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % statuses.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [statuses.length, intervalMs]);

  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-5 text-center">
      {/* Pulsing AI badge with a soft purple glow */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-3 animate-pulse rounded-full bg-primary/25 blur-xl"
        />
        <div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 shadow-lg shadow-primary/30 ring-1 ring-white/15">
          <Sparkles className="size-6 animate-pulse text-white" />
        </div>
      </div>

      {/* Cycling status text — re-mounts on change to cross-fade smoothly */}
      <p
        key={index}
        aria-live="polite"
        className="animate-in fade-in-0 slide-in-from-bottom-1 text-sm font-medium text-muted-foreground duration-500"
      >
        {statuses[index]}
      </p>

      {/* Subtle thinking dots */}
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 animate-pulse rounded-full bg-primary/70" />
        <span className="size-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:200ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:400ms]" />
      </div>
    </div>
  );
}

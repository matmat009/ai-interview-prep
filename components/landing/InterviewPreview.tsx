import { Mic, SendHorizontal } from "lucide-react";

import { PRESS } from "@/components/landing/interaction";

// Static, screenshot-like mirror of the real interview session UI
// (QuestionCard + AnswerInput), restyled: crisp 1px border + tight shadow,
// no blur/glow, one accent (progress fill + submit) only, mono for data labels.
// It sits still — no looping animation; the only motion is press feedback.
export function InterviewPreview() {
  return (
    <div
      id="sample-question"
      className="w-full rounded-2xl border border-white/12 bg-[#0d0d0f] shadow-[0_10px_34px_-14px_rgba(0,0,0,0.75)]"
    >
      {/* Question + progress */}
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-white/40 uppercase">
          <span>Question 2 of 7</span>
          <span className="tabular-nums">29%</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: "29%" }}
          />
        </div>
        <h2 className="mt-6 text-lg leading-snug font-semibold tracking-tight text-white text-balance sm:text-xl">
          Tell me about a time you shipped under a tight deadline. What tradeoff
          did you make, and how did you decide?
        </h2>
      </div>

      {/* Hairline divider — depth from the line, not a glow. */}
      <div className="h-px w-full bg-white/[0.08]" />

      {/* Answer */}
      <div className="p-6 sm:p-7">
        <span className="text-sm font-medium text-white/80">Your answer</span>
        <div className="mt-3 min-h-28 rounded-xl border border-white/12 bg-black/20 p-4">
          <p className="text-sm leading-relaxed text-white/35">
            Set the scene, then walk through the call you made and why: the
            constraints, the options, and the tradeoff you landed on.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Record answer with your microphone"
              className={`${PRESS} flex size-9 items-center justify-center border border-white/12 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/85`}
            >
              <Mic className="size-4" />
            </button>
            <span className="font-mono text-[11px] tracking-wide text-white/40 tabular-nums">
              0 words · 0 characters
            </span>
          </div>
          <button
            type="button"
            className={`${PRESS} inline-flex h-9 items-center gap-1.5 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90`}
          >
            Submit answer
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

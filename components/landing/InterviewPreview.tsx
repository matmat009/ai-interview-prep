"use client";

import { Mic, SendHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { PRESS } from "@/components/landing/interaction";

// Static, screenshot-like mirror of the real interview session UI
// (QuestionCard + AnswerInput), restyled: crisp 1px border + tight shadow,
// no blur/glow, one accent (progress fill + submit) only, mono for data labels.
// It sits still — the only motion is a one-time progress fill on load and a
// blinking caret that suggests the field is ready for input.
export function InterviewPreview() {
  // Same reduced-motion pattern as the rest of the landing page.
  const reduce = useReducedMotion();

  return (
    <div
      id="sample-question"
      className="w-full rounded-2xl border border-white/12 bg-[#0d0d0f] shadow-[0_10px_34px_-14px_rgba(0,0,0,0.75)]"
    >
      {/* Keyframe for the answer caret (scoped to this card). */}
      <style>{`
        @keyframes hero-caret-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      {/* Question + progress */}
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-white/40 uppercase">
          <span>Question 2 of 7</span>
          <span className="tabular-nums">29%</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          {/* One-time fill from 0% to 29% on load (ease-out). Reduced motion
              renders straight at 29% with no animation. Never loops. */}
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: reduce ? "29%" : "0%" }}
            animate={{ width: "29%" }}
            transition={{ duration: reduce ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
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
        <div className="relative mt-3 min-h-28 rounded-xl border border-white/12 bg-black/20 p-4">
          {/* Blinking caret — suggests the field is ready. Does not type; the
              placeholder is untouched. Static (no blink) under reduced motion. */}
          <span
            aria-hidden
            className={
              reduce
                ? "pointer-events-none absolute top-[17px] left-4 h-4 w-px bg-white/40"
                : "pointer-events-none absolute top-[17px] left-4 h-4 w-px bg-white/60 [animation:hero-caret-blink_1.1s_infinite]"
            }
          />
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

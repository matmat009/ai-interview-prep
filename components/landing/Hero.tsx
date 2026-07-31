import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InterviewPreview } from "@/components/landing/InterviewPreview";
import { PRESS } from "@/components/landing/interaction";

export function Hero() {
  return (
    <section className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 pt-32 pb-24 sm:pt-40 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      {/* Left: copy */}
      <div className="flex flex-col items-start text-left">
        {/* Flat eyebrow pill — no glow dot, no terminal punctuation. */}
        <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/60">
          AI mock interviews, real feedback
        </span>

        <h1 className="mt-6 max-w-2xl font-[family-name:var(--font-space-grotesk)] text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-white text-balance sm:text-5xl lg:text-[3.5rem]">
          Walk in already having done the interview.
        </h1>

        <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55 text-pretty">
          A full 7-question mock interview, tailored to your role — with
          instant, scored feedback on every answer. Rehearse the real thing
          before it counts.
        </p>

        <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/signup" />}
            className="h-11 rounded-xl px-5 duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] active:translate-y-0 active:scale-[0.98]"
          >
            Start practicing
            <ArrowRight className="size-4" />
          </Button>

          <a
            href="#sample-question"
            className={`${PRESS} inline-flex h-11 items-center border border-white/12 px-5 text-sm font-medium text-white/80 hover:bg-white/[0.04] hover:text-white`}
          >
            See a sample question
          </a>
        </div>

        <p className="mt-6 text-xs text-white/40">
          No credit card required · First session free
        </p>
      </div>

      {/* Right: static interview card */}
      <div className="w-full">
        <InterviewPreview />
      </div>
    </section>
  );
}

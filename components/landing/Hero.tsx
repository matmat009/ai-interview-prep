"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { Button } from "@/components/ui/button";
import { InterviewPreview } from "@/components/landing/InterviewPreview";
import { PRESS } from "@/components/landing/interaction";

export function Hero() {
  // Disable/soften all motion when the user prefers reduced motion.
  const reduce = useReducedMotion();

  // Parent orchestrates a gentle stagger across the copy elements.
  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: 0.15, // let the nav (starts at 0) visibly lead
        staggerChildren: reduce ? 0 : 0.07,
      },
    },
  };

  // Each copy element: fade + slight upward slide.
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.25 : 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="home"
      className="relative z-10 mx-auto grid w-full max-w-6xl scroll-mt-24 grid-cols-1 items-center gap-14 px-6 pt-32 pb-24 sm:pt-40 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
    >
      {/* Left: copy — staggered entrance (eyebrow → headline → sub → CTAs → trust). */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-start text-left"
      >
        {/* Flat eyebrow pill — no glow dot, no terminal punctuation. */}
        <motion.span
          variants={item}
          className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/60"
        >
          AI mock interviews, real feedback
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-6 max-w-2xl font-[family-name:var(--font-space-grotesk)] text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-white text-balance sm:text-5xl lg:text-[3.5rem]"
        >
          Walk in already having done the interview.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-lg text-base leading-relaxed text-white/55 text-pretty"
        >
          A full 7-question mock interview, tailored to your role, with
          instant, scored feedback on every answer. Rehearse the real thing
          before it counts.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
        >
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
        </motion.div>

        <motion.p variants={item} className="mt-6 text-xs text-white/40">
          No credit card required · First session free
        </motion.p>
      </motion.div>

      {/* Right: interview card — enters just after the copy, then floats gently. */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          duration: reduce ? 0.25 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={
            reduce
              ? undefined
              : {
                  duration: 6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                }
          }
        >
          <InterviewPreview />
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import type { ComponentType } from "react";

import {
  Gauge,
  History,
  Library,
  ListChecks,
  Mic,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

type Feature = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "Tailored questions",
    body: "AI-generated questions matched to your role and experience level.",
  },
  {
    icon: Gauge,
    title: "Scored feedback",
    body: "Instant, structured feedback with a score on every answer.",
  },
  {
    icon: ListChecks,
    title: "Realistic structure",
    body: "A fixed 7-question format that mirrors how a real interview is paced.",
  },
  {
    icon: RotateCcw,
    title: "Resume in progress",
    body: "Leave a session and continue later from the exact question you stopped on.",
  },
  {
    icon: History,
    title: "Session history",
    body: "Every session saved, with a full review of questions, answers, and feedback.",
  },
  {
    icon: Library,
    title: "Question Bank",
    body: "AI-generated, category-based practice per role, outside the full session.",
  },
  {
    icon: Target,
    title: "Adjust Focus",
    body: "Retarget a session's interview type mid-flow when you want to switch gears.",
  },
  {
    icon: Mic,
    title: "Speech-to-text input",
    body: "Answer out loud and have it transcribed, or type. Your choice.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Row-level security ties every record to your account, so only you can access your data.",
  },
];

export function Features() {
  // Same reduced-motion + variants pattern as the hero entrance.
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
  };
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
      id="features"
      className="relative z-10 scroll-mt-24 border-t border-white/[0.06] px-6 py-20 sm:py-28"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-6xl"
      >
        {/* Header group animates first as a unit. */}
        <motion.div variants={item}>
          <p className="font-mono text-xs tracking-wider text-primary/70 uppercase">
            Features
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.02em] text-white text-balance sm:text-4xl">
            Everything you need to practice like it's real.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/55 text-pretty">
            Built around a real interview loop, not a chatbot. Every feature here
            ships today.
          </p>
        </motion.div>

        {/* Then the feature cards stagger in. */}
        <motion.div
          variants={container}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-4" />
              </span>
              <h3 className="mt-4 text-sm font-semibold tracking-tight text-white">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55 text-pretty">
                {feature.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

const STEPS = [
  {
    n: "01",
    title: "A quick, AI-free setup",
    body: "Tell us your role, experience level, interview type, timeline, target companies, and what you're nervous about. It takes about a minute.",
  },
  {
    n: "02",
    title: "A realistic 7-question session",
    body: "One warmup, three role-specific questions, two general or closing questions, and one wildcard, paced the way a real interview runs.",
  },
  {
    n: "03",
    title: "Instant, scored feedback",
    body: "Every answer is scored and returned with specific strengths and concrete areas to improve, tailored to your profile.",
  },
  {
    n: "04",
    title: "Resume anytime, or drill solo",
    body: "Step away and pick a session back up right where you left off. For focused reps, Question Bank gives you single-question practice outside the full session.",
  },
];

export function HowItWorks() {
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
      id="how-it-works"
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
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.02em] text-white text-balance sm:text-4xl">
            From setup to scored feedback, in one sitting.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/55 text-pretty">
            No gimmicks and no busywork. Four steps take you from a blank slate to
            a realistic, scored practice run.
          </p>
        </motion.div>

        {/* Then the step cards stagger in. */}
        <motion.ol
          variants={container}
          className="mt-10 grid gap-4 md:grid-cols-2"
        >
          {STEPS.map((step) => (
            <motion.li
              key={step.n}
              variants={item}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
            >
              <span className="font-mono text-sm text-primary tabular-nums">
                {step.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55 text-pretty">
                {step.body}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </section>
  );
}

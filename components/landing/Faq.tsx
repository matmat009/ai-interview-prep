"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

const FAQS = [
  {
    q: "Is PrepPilot free to use?",
    a: "Yes. You can start practicing for free, no credit card required, and your first session is on the house.",
  },
  {
    q: "How do scoring and feedback work?",
    a: "After each answer, an AI evaluates it against the question and your profile, then returns a score along with specific strengths and concrete areas to improve.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your profile and sessions are protected by row-level security, so each account can only ever read or change its own data.",
  },
  {
    q: "Can I do more than one session a day?",
    a: "Each account gets one full mock session per day. It keeps AI usage fair for everyone and encourages focused, deliberate practice. For extra reps, use the Question Bank.",
  },
  {
    q: "What if I don't finish a session?",
    a: "Nothing is lost. An in-progress session can be resumed later, right from where you stopped.",
  },
  {
    q: "What roles and interview types are supported?",
    a: "Questions adapt to the role and experience level you set during setup, across interview types including behavioral, technical/coding, system design, and case study.",
  },
];

export function Faq() {
  // Same reduced-motion + variants pattern as the hero entrance.
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.14 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.25 : 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="faq"
      className="relative z-10 scroll-mt-24 border-t border-white/[0.06] px-6 py-20 sm:py-28"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4, margin: "-10% 0px" }}
        className="mx-auto max-w-3xl"
      >
        {/* Header group animates first as a unit. */}
        <motion.div variants={item}>
          <p className="font-mono text-xs tracking-wider text-primary/70 uppercase">
            FAQ
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.02em] text-white text-balance sm:text-4xl">
            Questions, answered.
          </h2>
        </motion.div>

        {/* Then the Q&A entries stagger in. */}
        <motion.dl variants={container} className="mt-10">
          {FAQS.map((faq) => (
            <motion.div
              key={faq.q}
              variants={item}
              className="border-t border-white/[0.06] py-6 first:border-t-0 first:pt-0"
            >
              <dt className="text-base font-medium text-white">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-white/55 text-pretty">
                {faq.a}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}

"use client";

import type { OnboardingStepProps } from "@/types/onboarding";

import { ChoiceStep } from "./ChoiceStep";

export function ExperienceStep({ value, onChange }: OnboardingStepProps) {
  return (
    <ChoiceStep
      title="What's your experience level?"
      value={value}
      onChange={onChange}
      otherPlaceholder="Describe your experience"
      options={[
        { label: "Entry-level / New grad", value: "Entry-level / New grad" },
        { label: "Mid-level (2–5 yrs)", value: "Mid-level (2–5 yrs)" },
        { label: "Senior (5–8 yrs)", value: "Senior (5–8 yrs)" },
        { label: "Staff/Principal", value: "Staff/Principal" },
      ]}
    />
  );
}

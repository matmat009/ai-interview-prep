"use client";

import type { OnboardingStepProps } from "@/types/onboarding";

import { ChoiceStep } from "./ChoiceStep";

export function TimelineStep({ value, onChange }: OnboardingStepProps) {
  return (
    <ChoiceStep
      title="How soon is your interview?"
      value={value}
      onChange={onChange}
      otherPlaceholder="When is it?"
      options={[
        { label: "This week", value: "This week" },
        { label: "Within a month", value: "Within a month" },
        { label: "1–3 months", value: "1–3 months" },
        {
          label: "Just practicing generally",
          value: "Just practicing generally",
        },
      ]}
    />
  );
}

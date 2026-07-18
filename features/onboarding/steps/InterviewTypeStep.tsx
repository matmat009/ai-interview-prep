"use client";

import type { OnboardingStepProps } from "@/types/onboarding";

import { ChoiceStep } from "./ChoiceStep";

export function InterviewTypeStep({ value, onChange }: OnboardingStepProps) {
  return (
    <ChoiceStep
      title="What type of interview are you focusing on?"
      value={value}
      onChange={onChange}
      otherPlaceholder="Which type?"
      options={[
        { label: "Behavioral", value: "Behavioral" },
        { label: "Technical/Coding", value: "Technical/Coding" },
        { label: "System Design", value: "System Design" },
        { label: "Case Study", value: "Case Study" },
      ]}
    />
  );
}

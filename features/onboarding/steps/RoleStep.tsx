"use client";

import type { OnboardingStepProps } from "@/types/onboarding";

import { ChoiceStep } from "./ChoiceStep";

export function RoleStep({ value, onChange }: OnboardingStepProps) {
  return (
    <ChoiceStep
      title="What role are you preparing for?"
      value={value}
      onChange={onChange}
      otherPlaceholder="Which role?"
      options={[
        { label: "Frontend Engineer", value: "Frontend Engineer" },
        { label: "Backend Engineer", value: "Backend Engineer" },
        { label: "Full Stack Engineer", value: "Full Stack Engineer" },
        { label: "Product Manager", value: "Product Manager" },
        { label: "Data Scientist", value: "Data Scientist" },
      ]}
    />
  );
}

// OnboardingAnswers is defined canonically in the shared types module; re-export
// it here so existing `@/types/onboarding` imports keep working.
import type { OnboardingAnswers } from "@/types/interview";

export type { OnboardingAnswers };

// The 6 answer keys in the order their steps appear in the wizard.
export const ONBOARDING_STEP_KEYS = [
  "role",
  "experience",
  "interviewType",
  "timeline",
  "companies",
  "concerns",
] as const satisfies readonly (keyof OnboardingAnswers)[];

export const EMPTY_ONBOARDING_ANSWERS: OnboardingAnswers = {
  role: "",
  experience: "",
  interviewType: "",
  timeline: "",
  companies: "",
  concerns: "",
};

// Props every onboarding step component receives. The answer is a controlled
// string owned by the wizard; a step reports its value back via `onChange`.
// An empty string means "no valid answer yet" (used to gate the Next button).
export interface OnboardingStepProps {
  value: string;
  onChange: (value: string) => void;
}

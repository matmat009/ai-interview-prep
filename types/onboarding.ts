// Shape of the data collected across the onboarding wizard.
// Every answer is a plain string: when the user picks "Other", the free-text
// value replaces the selected option's value, so the field stays a string.
export interface OnboardingAnswers {
  role: string;
  experience: string;
  interviewType: string;
  timeline: string;
  companies: string;
  concerns: string;
}

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

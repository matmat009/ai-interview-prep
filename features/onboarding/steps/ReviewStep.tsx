"use client";

import { Button } from "@/components/ui/button";
import {
  ONBOARDING_STEP_KEYS,
  type OnboardingAnswers,
} from "@/types/onboarding";

const QUESTION_LABELS: Record<keyof OnboardingAnswers, string> = {
  role: "Role you're preparing for",
  experience: "Experience level",
  interviewType: "Interview type",
  timeline: "Interview timeline",
  companies: "Companies",
  concerns: "Focus areas / concerns",
};

interface ReviewStepProps {
  answers: OnboardingAnswers;
  onEdit: (stepIndex: number) => void;
  onSubmit: () => void;
  error?: string | null;
}

export function ReviewStep({
  answers,
  onEdit,
  onSubmit,
  error,
}: ReviewStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Review your answers</h2>
        <p className="text-sm text-muted-foreground">
          Make sure everything looks right before you finish.
        </p>
      </div>

      <dl className="flex flex-col divide-y divide-border rounded-lg border">
        {ONBOARDING_STEP_KEYS.map((key, index) => {
          const answer = answers[key].trim();
          return (
            <div
              key={key}
              className="flex items-start justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <dt className="text-sm font-medium">{QUESTION_LABELS[key]}</dt>
                <dd
                  className={
                    answer
                      ? "text-sm break-words text-foreground"
                      : "text-sm break-words text-muted-foreground italic"
                  }
                >
                  {answer || "Not answered"}
                </dd>
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto shrink-0 p-0"
                onClick={() => onEdit(index)}
              >
                Edit
              </Button>
            </div>
          );
        })}
      </dl>

      {error && (
        <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button onClick={onSubmit} className="w-full">
        Submit
      </Button>
    </div>
  );
}

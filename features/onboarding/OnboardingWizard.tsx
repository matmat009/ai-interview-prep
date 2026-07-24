"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ThinkingIndicator } from "@/components/thinking-indicator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  EMPTY_ONBOARDING_ANSWERS,
  ONBOARDING_STEP_KEYS,
  type OnboardingAnswers,
  type OnboardingStepProps,
} from "@/types/onboarding";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { CompaniesStep } from "./steps/CompaniesStep";
import { ConcernsStep } from "./steps/ConcernsStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { InterviewTypeStep } from "./steps/InterviewTypeStep";
import { ReviewStep } from "./steps/ReviewStep";
import { RoleStep } from "./steps/RoleStep";
import { TimelineStep } from "./steps/TimelineStep";

// All 6 question steps now have real content.
const STEP_COMPONENTS: Record<
  keyof OnboardingAnswers,
  React.ComponentType<OnboardingStepProps>
> = {
  role: RoleStep,
  experience: ExperienceStep,
  interviewType: InterviewTypeStep,
  timeline: TimelineStep,
  companies: CompaniesStep,
  concerns: ConcernsStep,
};

// Only these gate the Next button; companies + concerns are optional.
const REQUIRED_KEYS = new Set<keyof OnboardingAnswers>([
  "role",
  "experience",
  "interviewType",
  "timeline",
]);

const TOTAL_STEPS = ONBOARDING_STEP_KEYS.length; // 6 questions
const REVIEW_INDEX = TOTAL_STEPS; // review screen sits right after them

const SUBMIT_STATUSES = [
  "Saving your profile...",
  "Setting up your dashboard...",
  "Almost there...",
];

export function OnboardingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    EMPTY_ONBOARDING_ANSWERS,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isReviewStep = stepIndex === REVIEW_INDEX;
  const isFirstStep = stepIndex === 0;

  const currentKey = isReviewStep ? null : ONBOARDING_STEP_KEYS[stepIndex];
  const currentValue = currentKey ? answers[currentKey] : "";
  const StepComponent = currentKey ? STEP_COMPONENTS[currentKey] : null;

  const isRequired = currentKey ? REQUIRED_KEYS.has(currentKey) : false;
  const isCurrentValid = !isRequired || currentValue.trim().length > 0;

  const progress = isReviewStep ? 100 : ((stepIndex + 1) / TOTAL_STEPS) * 100;

  function updateAnswer(key: keyof OnboardingAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleBack() {
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function handleNext() {
    if (!isCurrentValid) return;
    setStepIndex((index) => Math.min(REVIEW_INDEX, index + 1));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSubmitError(
        "You need to be signed in to save your profile. Please log in again.",
      );
      setSubmitting(false);
      return;
    }

    // Upsert so it works for a first-time save or a later re-submit/edit.
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      role: answers.role,
      experience: answers.experience,
      interview_type: answers.interviewType,
      timeline: answers.timeline,
      companies: answers.companies,
      concerns: answers.concerns,
      onboarding_completed: true,
    });

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    // Only navigate once the write succeeds.
    router.push("/interview");
  }

  return (
    <Card className="w-[800px] max-w-full border border-white/10 bg-card/60 shadow-2xl ring-0 backdrop-blur-xl">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isReviewStep ? "Review" : `Step ${stepIndex + 1} of ${TOTAL_STEPS}`}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent>
        {submitting ? (
          <ThinkingIndicator statuses={SUBMIT_STATUSES} />
        ) : isReviewStep ? (
          <ReviewStep
            answers={answers}
            onEdit={setStepIndex}
            onSubmit={handleSubmit}
            error={submitError}
          />
        ) : (
          StepComponent &&
          currentKey && (
            <StepComponent
              value={currentValue}
              onChange={(value) => updateAnswer(currentKey, value)}
            />
          )
        )}
      </CardContent>

      {!submitting && (
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={handleBack} disabled={isFirstStep}>
            <ArrowLeft />
            Back
          </Button>
          {!isReviewStep && (
            <Button onClick={handleNext} disabled={!isCurrentValid}>
              Next
              <ArrowRight />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

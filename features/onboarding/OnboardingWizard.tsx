"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

export function OnboardingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    EMPTY_ONBOARDING_ANSWERS,
  );

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

  function handleSubmit() {
    // Placeholder submit — Supabase persistence comes later.
    console.log("onboarding complete", answers);
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
        {isReviewStep ? (
          <ReviewStep
            answers={answers}
            onEdit={setStepIndex}
            onSubmit={handleSubmit}
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
    </Card>
  );
}

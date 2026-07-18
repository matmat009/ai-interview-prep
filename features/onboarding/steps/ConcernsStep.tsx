"use client";

import type { OnboardingStepProps } from "@/types/onboarding";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ConcernsStep({ value, onChange }: OnboardingStepProps) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-lg font-semibold">
        Is there anything specific you&apos;re nervous about or want to focus on?
      </legend>
      <div className="flex flex-col gap-2">
        <Label htmlFor="concerns" className="text-muted-foreground">
          Optional
        </Label>
        <Textarea
          id="concerns"
          value={value}
          rows={4}
          placeholder="e.g. I freeze up on 'tell me about a time' questions..."
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </fieldset>
  );
}

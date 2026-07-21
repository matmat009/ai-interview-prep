"use client";

import type { OnboardingStepProps } from "@/types/onboarding";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompaniesStep({ value, onChange }: OnboardingStepProps) {
  return (
    <fieldset className="flex flex-col gap-6">
      <legend className="text-lg font-semibold">
        What companies are you interviewing with (if any)?
      </legend>
      <div className="flex flex-col gap-2">
        <Label htmlFor="companies" className="text-muted-foreground">
          Optional
        </Label>
        <Input
          id="companies"
          value={value}
          placeholder="e.g. Google, a Series B startup, still applying..."
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </fieldset>
  );
}

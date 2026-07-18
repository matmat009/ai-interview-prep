"use client";

import { useState } from "react";

import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingStepProps } from "@/types/onboarding";

// Sentinel for the "Other" card's selected state. Never stored as an answer —
// when "Other" is picked, the answer is the free-text value (or "" until typed).
const OTHER = "__other__";

export interface ChoiceOption {
  label: string;
  value: string;
}

interface ChoiceStepProps extends OnboardingStepProps {
  title: string;
  options: ChoiceOption[];
  otherLabel?: string;
  otherPlaceholder?: string;
}

export function ChoiceStep({
  title,
  options,
  value,
  onChange,
  otherLabel = "Other",
  otherPlaceholder = "Tell us more…",
}: ChoiceStepProps) {
  const presetValues = options.map((option) => option.value);

  // Derive the initial UI mode from the stored answer so selections survive
  // Back/Next navigation (each step remounts with its saved value).
  const [selected, setSelected] = useState<string | null>(() => {
    if (presetValues.includes(value)) return value;
    if (value.trim() !== "") return OTHER;
    return null;
  });
  const [otherText, setOtherText] = useState(() =>
    presetValues.includes(value) ? "" : value,
  );

  function selectPreset(optionValue: string) {
    setSelected(optionValue);
    setOtherText("");
    onChange(optionValue);
  }

  function selectOther() {
    setSelected(OTHER);
    // Empty until the user types — keeps the answer invalid so Next stays off.
    onChange(otherText.trim());
  }

  function changeOtherText(text: string) {
    setOtherText(text);
    onChange(text.trim());
  }

  const otherInvalid = selected === OTHER && otherText.trim() === "";

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-lg font-semibold">{title}</legend>

      <div
        role="radiogroup"
        aria-label={title}
        className="grid gap-3 sm:grid-cols-2"
      >
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onSelect={() => selectPreset(option.value)}
          />
        ))}
        <OptionCard
          label={otherLabel}
          selected={selected === OTHER}
          onSelect={selectOther}
        />
      </div>

      {selected === OTHER && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-other">{otherLabel}</Label>
          <Input
            id="onboarding-other"
            autoFocus
            value={otherText}
            placeholder={otherPlaceholder}
            aria-invalid={otherInvalid}
            onChange={(event) => changeOtherText(event.target.value)}
          />
        </div>
      )}
    </fieldset>
  );
}

function OptionCard({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border p-4 text-left text-sm font-medium outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      <span>{label}</span>
      {selected && <CheckIcon className="size-4 shrink-0" />}
    </button>
  );
}

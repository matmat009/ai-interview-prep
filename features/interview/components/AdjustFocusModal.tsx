"use client";

import { useEffect, useState } from "react";

import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionFocusOverride } from "@/types/interview";

const DEFAULT_TYPE = "System Design";

// Same options as onboarding's InterviewTypeStep, with a one-line description.
const TYPE_OPTIONS = [
  {
    value: "Behavioral",
    title: "Behavioral",
    description: "Past experiences, teamwork, and how you handle challenges",
  },
  {
    value: "Technical/Coding",
    title: "Technical/Coding",
    description: "Coding problems and technical skill assessment",
  },
  {
    value: "System Design",
    title: "System Design",
    description: "Architecture and designing large-scale systems",
  },
  {
    value: "Case Study",
    title: "Case Study",
    description: "Real-world problem-solving and business scenarios",
  },
  {
    value: "Other",
    title: "Other",
    description: "Specify your own custom focus area",
  },
];

export function AdjustFocusModal({
  open,
  onOpenChange,
  value,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: SessionFocusOverride;
  onSave: (override: SessionFocusOverride) => void;
}) {
  const [draftType, setDraftType] = useState(
    value.interviewType ?? DEFAULT_TYPE,
  );
  const [draftTopic, setDraftTopic] = useState(value.specificTopic ?? "");

  // Re-sync the draft with the current values each time the modal opens.
  useEffect(() => {
    if (open) {
      setDraftType(value.interviewType ?? DEFAULT_TYPE);
      setDraftTopic(value.specificTopic ?? "");
    }
  }, [open, value.interviewType, value.specificTopic]);

  function handleSave() {
    const specificTopic = draftTopic.trim();
    onSave({ interviewType: draftType, specificTopic: specificTopic || undefined });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust focus</DialogTitle>
          <DialogDescription>
            Tune this session only — your saved preferences stay the same.
          </DialogDescription>
          <p className="text-xs text-muted-foreground">
            This changes the role-specific questions in your session (Q2–4).
            Your onboarding profile and general questions stay the same.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label>Interview type</Label>
            <div
              role="radiogroup"
              aria-label="Interview type"
              className="flex flex-col gap-2.5"
            >
              {TYPE_OPTIONS.map((option) => {
                const selected = draftType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setDraftType(option.value)}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-lg border p-3.5 text-left outline-none transition-colors",
                      "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          selected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {option.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {selected && (
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="focus-topic">
              Specific topic{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="focus-topic"
              value={draftTopic}
              onChange={(event) => setDraftTopic(event.target.value)}
              placeholder="e.g. distributed systems, React performance, leadership stories..."
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Same options as onboarding's InterviewTypeStep.
const TYPE_ITEMS = [
  { label: "Behavioral", value: "Behavioral" },
  { label: "Technical/Coding", value: "Technical/Coding" },
  { label: "System Design", value: "System Design" },
  { label: "Case Study", value: "Case Study" },
  { label: "Other", value: "Other" },
];

export function AdjustFocusModal({
  open,
  onOpenChange,
  interviewType,
  topic,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewType: string;
  topic: string;
  onSave: (interviewType: string, topic: string) => void;
}) {
  const [draftType, setDraftType] = useState(interviewType);
  const [draftTopic, setDraftTopic] = useState(topic);

  // Re-sync the draft with the current values each time the modal opens.
  useEffect(() => {
    if (open) {
      setDraftType(interviewType);
      setDraftTopic(topic);
    }
  }, [open, interviewType, topic]);

  function handleSave() {
    onSave(draftType, draftTopic.trim());
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
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="interview-type">Interview type</Label>
            <Select
              value={draftType}
              onValueChange={(v) => setDraftType(String(v))}
              items={TYPE_ITEMS}
            >
              <SelectTrigger id="interview-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TYPE_ITEMS.map((it) => (
                    <SelectItem key={it.value} value={it.value}>
                      {it.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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

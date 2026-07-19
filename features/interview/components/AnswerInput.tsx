"use client";

import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Minimum characters before an answer counts as "meaningful" enough to submit.
const MIN_CHARS = 10;

export function AnswerInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const trimmed = value.trim();
  const charCount = trimmed.length;
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const canSubmit = charCount >= MIN_CHARS;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <label htmlFor="answer" className="text-sm font-medium text-foreground">
        Your answer
      </label>
      <Textarea
        id="answer"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Take a breath and answer as you would in a real interview…"
        className="mt-3 min-h-44 resize-y bg-background/40 text-base leading-relaxed"
      />

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground tabular-nums">
          {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount}{" "}
          characters
        </span>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
        >
          Submit Answer
          <SendHorizontal />
        </Button>
      </div>
    </div>
  );
}

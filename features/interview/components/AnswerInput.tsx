"use client";

import { useCallback, useRef } from "react";

import { Mic, MicOff, SendHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  appendTranscript,
  useSpeechRecognition,
} from "@/features/interview/use-speech-recognition";

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

  // Keep the latest value for the speech callback without re-creating the
  // recognition instance (which is set up once with a stable handler).
  const valueRef = useRef(value);
  valueRef.current = value;
  const handleTranscript = useCallback(
    (chunk: string) => onChange(appendTranscript(valueRef.current, chunk)),
    [onChange],
  );
  const { supported, listening, error, toggle } =
    useSpeechRecognition(handleTranscript);

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
        <div className="flex items-center gap-3">
          {/* Mic button only renders where the browser supports SpeechRecognition. */}
          {supported && (
            <button
              type="button"
              onClick={toggle}
              aria-pressed={listening}
              aria-label={
                listening
                  ? "Stop recording"
                  : "Record answer with your microphone"
              }
              className={cn(
                "relative flex size-9 items-center justify-center rounded-lg border transition-colors",
                listening
                  ? "border-red-500/40 bg-red-500/15 text-red-400"
                  : "border-white/10 bg-background/40 text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              {listening ? (
                <MicOff className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
              {listening && (
                <span className="absolute -top-1 -right-1 flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                </span>
              )}
            </button>
          )}
          {listening ? (
            <span className="text-xs font-medium text-red-400">Listening…</span>
          ) : (
            <span className="text-xs text-muted-foreground tabular-nums">
              {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount}{" "}
              characters
            </span>
          )}
        </div>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
        >
          Submit Answer
          <SendHorizontal />
        </Button>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal Web Speech API typings (not in lib.dom across all TS versions).
type SpeechAlternative = { transcript: string };
type SpeechResult = { 0: SpeechAlternative; isFinal: boolean };
type SpeechResultList = { length: number; [i: number]: SpeechResult };
type SpeechResultEvent = { resultIndex: number; results: SpeechResultList };
type SpeechErrorEvent = { error: string };
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

// --- pure, testable helpers -------------------------------------------------

// The SpeechRecognition constructor for this browser, or null if unsupported.
export function pickRecognitionCtor(win: unknown): RecognitionCtor | null {
  if (!win) return null;
  const w = win as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Concatenate only the FINAL transcript chunks from a result event.
export function extractFinalTranscript(event: SpeechResultEvent): string {
  let out = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const r = event.results[i];
    if (r.isFinal) out += r[0].transcript;
  }
  return out.trim();
}

// Append a transcribed chunk to existing text, adding a space only when needed.
export function appendTranscript(base: string, chunk: string): string {
  if (!chunk) return base;
  if (!base) return chunk;
  return /\s$/.test(base) ? base + chunk : base + " " + chunk;
}

// User-facing message for an error code, or null when it's benign (no message).
export function describeSpeechError(code: string): string | null {
  if (code === "not-allowed" || code === "service-not-allowed")
    return "Microphone access denied — you can still type your answer.";
  if (code === "no-speech" || code === "aborted") return null;
  return "Speech recognition ran into a problem — you can still type your answer.";
}

// --- hook -------------------------------------------------------------------

export function useSpeechRecognition(onResult: (text: string) => void) {
  // false on SSR + first client paint, so the mic button never causes a
  // hydration mismatch; it appears after the mount effect confirms support.
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  // Latest callback without re-creating the recognition instance.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    setSupported(
      pickRecognitionCtor(typeof window === "undefined" ? null : window) !==
        null,
    );
    return () => recognitionRef.current?.abort();
  }, []);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = pickRecognitionCtor(
      typeof window === "undefined" ? null : window,
    );
    if (!Ctor) return;
    setError(null);
    const recognition = new Ctor();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const finalChunk = extractFinalTranscript(e);
      if (finalChunk) onResultRef.current(finalChunk);
    };
    recognition.onerror = (e) => {
      const msg = describeSpeechError(e.error);
      if (msg) setError(msg);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if already started — safe to ignore.
    }
  }, []);

  const toggle = useCallback(
    () => (listening ? stop() : start()),
    [listening, start, stop],
  );

  return { supported, listening, error, toggle };
}

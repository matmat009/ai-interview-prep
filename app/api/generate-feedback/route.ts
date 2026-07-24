import { NextResponse } from "next/server";

import { generateFeedback } from "@/lib/gemini";
import type {
  OnboardingAnswers,
  QuestionCategory,
} from "@/types/interview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CATEGORIES: QuestionCategory[] = [
  "warmup",
  "role-specific",
  "general",
  "wildcard",
];

// Fields the feedback prompt actually relies on from the onboarding profile.
const REQUIRED_ONBOARDING = ["role", "experience"] as const;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const { question, answer, category, onboarding } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof question !== "string" || question.trim() === "") {
    return badRequest('"question" is required and must be a non-empty string.');
  }

  // `answer` may be empty/gibberish — that's a valid case the model handles —
  // but the field itself must be present as a string.
  if (typeof answer !== "string") {
    return badRequest('"answer" is required and must be a string.');
  }

  if (
    typeof category !== "string" ||
    !CATEGORIES.includes(category as QuestionCategory)
  ) {
    return badRequest(
      `"category" is required and must be one of: ${CATEGORIES.join(", ")}.`,
    );
  }

  if (!onboarding || typeof onboarding !== "object") {
    return badRequest('"onboarding" is required and must be an object.');
  }
  const ob = onboarding as Record<string, unknown>;
  const missing = REQUIRED_ONBOARDING.filter(
    (key) => typeof ob[key] !== "string" || (ob[key] as string).trim() === "",
  );
  if (missing.length > 0) {
    return badRequest(
      `"onboarding" is missing required fields: ${missing.join(", ")}.`,
    );
  }

  try {
    const feedback = await generateFeedback({
      question,
      answer,
      category: category as QuestionCategory,
      onboarding: onboarding as OnboardingAnswers,
    });
    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

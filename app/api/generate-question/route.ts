import { NextResponse } from "next/server";

import { generateQuestion } from "@/lib/gemini";
import type {
  OnboardingAnswers,
  QuestionCategory,
  SessionFocusOverride,
} from "@/types/interview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CATEGORIES: QuestionCategory[] = [
  "warmup",
  "role-specific",
  "general",
  "wildcard",
];

// Fields the prompt actually relies on from the onboarding profile.
const REQUIRED_ONBOARDING = ["role", "experience", "interviewType"] as const;

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

  const { category, onboarding, focusOverride, previousQuestions, weightToConcern } =
    (body ?? {}) as Record<string, unknown>;

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

  let prev: string[] = [];
  if (previousQuestions !== undefined) {
    if (
      !Array.isArray(previousQuestions) ||
      previousQuestions.some((q) => typeof q !== "string")
    ) {
      return badRequest('"previousQuestions" must be an array of strings.');
    }
    prev = previousQuestions as string[];
  }

  if (
    focusOverride !== undefined &&
    focusOverride !== null &&
    typeof focusOverride !== "object"
  ) {
    return badRequest('"focusOverride" must be an object when provided.');
  }

  if (weightToConcern !== undefined && typeof weightToConcern !== "boolean") {
    return badRequest('"weightToConcern" must be a boolean when provided.');
  }

  try {
    const question = await generateQuestion({
      category: category as QuestionCategory,
      onboarding: onboarding as OnboardingAnswers,
      focusOverride: (focusOverride ?? undefined) as
        | SessionFocusOverride
        | undefined,
      previousQuestions: prev,
      weightToConcern: weightToConcern === true,
    });
    return NextResponse.json({ question });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

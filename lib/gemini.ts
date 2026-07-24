import { GoogleGenAI, Type } from "@google/genai";

import type {
  Feedback,
  OnboardingAnswers,
  QuestionCategory,
  SessionFocusOverride,
} from "@/types/interview";

// Fast, free-tier flash model — appropriate for interview question/feedback
// generation. Pinned to a stable, non-preview Flash-Lite version: Flash-Lite
// tiers carry the highest free-tier daily request limits, which matters for a
// ~14-call-per-session app (gemini-3.5-flash's 20/day is far too low).
const MODEL = "gemini-3.1-flash-lite";

// Distinct model with its own free-tier daily quota bucket (quotas are
// per-project *per-model*). Used only when the primary's daily quota is spent,
// so a day's usage can spill over instead of hard-failing.
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set — add it to .env.local before calling Gemini.",
    );
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

// Retry transient Gemini failures (429 rate-limit, 503 overloaded) with short
// exponential backoff. Non-transient errors throw immediately.
const RETRY_DELAYS_MS = [1000, 2000]; // 2 retries: 1s, then 2s

function errorText(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).toLowerCase();
}

// Daily per-model quota exhaustion. Backoff can't fix this today — but a
// different model has its own quota bucket, so we fail over instead.
function isDailyQuotaExhausted(error: unknown): boolean {
  const text = errorText(error);
  return (
    text.includes("generaterequestsperdayperprojectpermodel") ||
    (text.includes("resource_exhausted") && /per\s?day/.test(text))
  );
}

// Transient rate-limit / overload — worth a short backoff on the same model.
// Explicitly excludes daily quota, which backoff would only waste time on.
function isTransient(error: unknown): boolean {
  if (isDailyQuotaExhausted(error)) return false;
  const text = errorText(error);
  return (
    /\b(429|503)\b/.test(text) ||
    text.includes("resource_exhausted") ||
    text.includes("unavailable") ||
    text.includes("overloaded") ||
    text.includes("high demand")
  );
}

type GenerateRequest = Parameters<GoogleGenAI["models"]["generateContent"]>[0];

async function generateWithRetry(request: GenerateRequest) {
  const ai = getClient();
  // Always start on the primary model, so once Google resets the daily quota
  // requests succeed on it again with no manual intervention.
  let model = request.model;
  let triedFallback = false;
  let transientAttempts = 0;

  for (;;) {
    try {
      const response = await ai.models.generateContent({ ...request, model });
      console.log(`[gemini] request served by ${model}`);
      return response;
    } catch (error) {
      // Primary is out of daily quota — fail over to the fallback model once.
      if (!triedFallback && isDailyQuotaExhausted(error)) {
        console.warn(
          `[gemini] daily quota exhausted on ${model} — retrying with ${FALLBACK_MODEL}`,
        );
        triedFallback = true;
        model = FALLBACK_MODEL;
        continue; // not transient — no backoff
      }
      if (transientAttempts < RETRY_DELAYS_MS.length && isTransient(error)) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS_MS[transientAttempts]),
        );
        transientAttempts++;
        continue;
      }
      throw error;
    }
  }
}

/**
 * Sends a plain-text prompt to Gemini and returns the raw text response.
 * Throws a clear error if the key is missing or the request fails.
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    const response = await generateWithRetry({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini request failed: ${message}`);
  }
}

// Strip anything the model adds despite instructions: surrounding quotes, a
// leading list marker (e.g. "1." or "-"), and stray whitespace.
function cleanQuestion(text: string): string {
  let q = text.trim();
  q = q.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, "");
  q = q.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
  return q;
}

// Wildcard closers — one is picked at random per generation so the category
// reliably lands in a real closing bucket instead of drifting technical.
const WILDCARD_ANGLES = [
  "a self-assessment of the candidate's key strengths, or a weakness they're actively working to improve",
  "a cultural-fit / values question about how they like to work or what they value in a team and company",
  "an invitation for the candidate to ask their own questions, framed so they can demonstrate the research they've done on the company or role",
  'a "why should we hire you" question that invites them to articulate their unique value proposition',
];

// General-round angles — one is picked at random per generation so the category
// reliably covers career/comp/value/logistics instead of drifting behavioral.
const GENERAL_ANGLES = [
  "career motivation — why they want this role or company, or their long-term career goals",
  "compensation expectations — their expected salary or comp range for this role",
  "the unique value or contribution they would bring to this company",
  "availability and logistics — notice period, ideal start date, or work-arrangement preferences (remote / hybrid / onsite)",
];

/**
 * Generates a single interview question tailored to the candidate's onboarding
 * profile, the question's role in the flow (category), and any per-session focus
 * override — while avoiding repeats of questions already asked this session.
 * Returns only the question text.
 */
export async function generateQuestion(params: {
  category: QuestionCategory;
  onboarding: OnboardingAnswers;
  focusOverride?: SessionFocusOverride;
  previousQuestions: string[];
  // The caller decides which questions target the candidate's stated concern
  // (see features/interview/concern-plan.ts), so it's deterministic per session.
  weightToConcern?: boolean;
}): Promise<string> {
  const {
    category,
    onboarding,
    focusOverride,
    previousQuestions,
    weightToConcern = false,
  } = params;

  const role = onboarding.role?.trim() || "this role";
  const experience =
    onboarding.experience?.trim() || "an unspecified experience level";
  // Effective interview type: the session override wins over the onboarding profile.
  const interviewType =
    focusOverride?.interviewType?.trim() ||
    onboarding.interviewType?.trim() ||
    "general";
  const specificTopic = focusOverride?.specificTopic?.trim();
  const concerns = onboarding.concerns?.trim();
  const companies = onboarding.companies?.trim();

  // Only weight toward the concern when the caller asked for it and one exists.
  const applyConcern = weightToConcern && Boolean(concerns);

  let instruction = "";
  switch (category) {
    case "warmup":
      instruction = `Generate a simple, direct opening line asking the candidate to introduce themselves and say what draws them to a ${role} role — the way a real interviewer naturally opens a conversation (for example: "Please introduce yourself, and tell me what draws you to ${role}."). Keep it short and natural; avoid long, elaborate, or flowery phrasing.`;
      break;
    case "role-specific":
      instruction = `Generate one ${interviewType} interview question for a ${role} candidate. Calibrate the depth and difficulty to ${experience}.`;
      if (specificTopic) {
        instruction += ` Weight the question toward this specific topic: "${specificTopic}".`;
      }
      break;
    case "general": {
      const angle =
        GENERAL_ANGLES[Math.floor(Math.random() * GENERAL_ANGLES.length)];
      instruction = `Generate one general professional interview question for a ${role} candidate about ${angle}. Do NOT ask a behavioral "tell me about a time…" question, and do NOT ask a technical or trade-off question — those belong to other rounds.`;
      break;
    }
    case "wildcard": {
      const angle =
        WILDCARD_ANGLES[Math.floor(Math.random() * WILDCARD_ANGLES.length)];
      instruction = `Generate one closing interview question for a ${role} candidate. Specifically, make it ${angle}. This must be a genuine closing/behavioral-style question — do NOT ask a role-specific or technical question.`;
      break;
    }
  }

  if (applyConcern) {
    instruction += ` The candidate has said they struggle with: "${concerns}". Shape this question so it gives them practice on exactly that — work it in naturally, and don't mention that they told you.`;
  }

  // Soft background only. Explicitly barred from inventing company specifics,
  // which the model has no verified information about.
  const companyContext = companies
    ? `\n\nBackground (context only): the candidate is preparing for interviews at: ${companies}. Do NOT imitate or claim any specific company's real interview format, process, or questions — you have no verified information about them. Use this only as light context about their goals.`
    : "";

  const avoidBlock = previousQuestions.length
    ? `\n\nDo NOT repeat or closely resemble any of these questions already asked in this session:\n${previousQuestions
        .map((q) => `- ${q}`)
        .join("\n")}`
    : "";

  const prompt = `You are a warm, experienced human interviewer running a realistic mock interview. Phrase the question the way a real interviewer would actually say it out loud — natural, conversational, and human. Do NOT sound like a corporate FAQ, a textbook, or generated AI text, and keep it simple and direct rather than long-winded or overly formal.

${instruction}${companyContext}${avoidBlock}

Return ONLY the question text — no preamble, no surrounding quotes, no numbering, no commentary. Just the single question.`;

  const raw = await generateContent(prompt);
  return cleanQuestion(raw);
}

// Structured-output schema so Gemini returns feedback in exactly the Feedback shape.
const FEEDBACK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    score: { type: Type.INTEGER },
  },
  required: ["summary", "strengths", "improvements", "score"],
};

// Validate the parsed model output against the Feedback shape before trusting it.
function parseFeedback(value: unknown): Feedback {
  if (!value || typeof value !== "object") {
    throw new Error("Feedback response was not a JSON object.");
  }
  const v = value as Record<string, unknown>;

  if (typeof v.summary !== "string") {
    throw new Error("Feedback 'summary' must be a string.");
  }
  if (
    !Array.isArray(v.strengths) ||
    v.strengths.some((s) => typeof s !== "string")
  ) {
    throw new Error("Feedback 'strengths' must be an array of strings.");
  }
  if (
    !Array.isArray(v.improvements) ||
    v.improvements.some((s) => typeof s !== "string")
  ) {
    throw new Error("Feedback 'improvements' must be an array of strings.");
  }
  if (typeof v.score !== "number" || Number.isNaN(v.score)) {
    throw new Error("Feedback 'score' must be a number.");
  }

  return {
    summary: v.summary,
    strengths: v.strengths as string[],
    improvements: v.improvements as string[],
    score: Math.max(0, Math.min(100, Math.round(v.score))),
  };
}

/**
 * Evaluates a candidate's answer to a question and returns structured feedback
 * (summary, strengths, improvements, 0–100 score), calibrated to their
 * experience level. Uses Gemini's JSON response schema for reliable shape, and
 * throws a clear error if the response can't be parsed into valid Feedback.
 */
export async function generateFeedback(params: {
  question: string;
  answer: string;
  category: QuestionCategory;
  onboarding: OnboardingAnswers;
}): Promise<Feedback> {
  const { question, answer, category, onboarding } = params;

  const role = onboarding.role?.trim() || "the role";
  const experience =
    onboarding.experience?.trim() || "an unspecified experience level";
  const concerns = onboarding.concerns?.trim();
  const companies = onboarding.companies?.trim();

  const concernNote = concerns
    ? `\n\nThe candidate has said they struggle with: "${concerns}". If this answer relates to that, acknowledge it supportively in the summary — note progress or offer encouragement. If it's unrelated, ignore this entirely rather than forcing it in.`
    : "";

  // Soft background only — no invented company specifics.
  const companyContext = companies
    ? `\n\nBackground (context only): they're preparing for interviews at: ${companies}. Do NOT reference any specific company's real process, bar, or standards — you have no verified information about them.`
    : "";

  const prompt = `You are an experienced interviewer giving honest, constructive feedback on a candidate's answer in a mock interview.

Role the candidate is preparing for: ${role}
Candidate experience level: ${experience}
Question category: ${category}

QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer.trim() ? answer : "(no answer provided)"}

Evaluate the answer against the question. Calibrate expectations to the candidate's experience level — do not expect senior-level depth from an entry-level candidate, and hold senior candidates to a higher bar.${concernNote}${companyContext}

- summary: one or two sentences on the overall quality of this specific answer.
- strengths: 2-3 specific things the candidate actually did well IN THIS ANSWER (reference what they said; not generic advice). If there are genuinely no strengths, return an empty array.
- improvements: 2-3 specific, actionable improvements based on what was actually said or missing.
- score: an integer from 0 to 100 reflecting this answer's quality for this experience level.

CRITICAL: If the answer is empty, extremely short, off-topic, or gibberish (e.g. random characters), do NOT fabricate substantive feedback. Give a score near 0, and clearly state in the summary and improvements that no real answer was provided.`;

  let response;
  try {
    response = await generateWithRetry({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: FEEDBACK_SCHEMA,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini request failed: ${message}`);
  }

  const raw = response.text;
  if (!raw) {
    throw new Error("Gemini returned an empty feedback response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `Gemini returned unparseable JSON feedback: ${raw.slice(0, 200)}`,
    );
  }

  return parseFeedback(parsed);
}

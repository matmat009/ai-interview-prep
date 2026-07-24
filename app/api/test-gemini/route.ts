import { NextResponse } from "next/server";

import { generateContent } from "@/lib/gemini";

// Temporary sanity-check route: GET /api/test-gemini confirms the API key and
// client work end-to-end. Remove once real Gemini usage is wired up.
// `force-dynamic` keeps it out of build-time static evaluation (which would run
// without the key) so it only executes on a real request.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const text = await generateContent("Say hello in one sentence.");
    return NextResponse.json({ ok: true, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

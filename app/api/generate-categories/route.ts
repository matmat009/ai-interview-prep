import { NextResponse } from "next/server";

import { generateCategories } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  const { role } = (body ?? {}) as Record<string, unknown>;
  if (typeof role !== "string" || role.trim() === "") {
    return badRequest('"role" is required and must be a non-empty string.');
  }

  try {
    const categories = await generateCategories(role);
    return NextResponse.json({ categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

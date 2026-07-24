import { InterviewSession } from "@/features/interview/components/InterviewSession";
import type { SessionFocusOverride } from "@/types/interview";

export default async function InterviewSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sessionId } = await params;
  const sp = await searchParams;

  // Per-session focus override, carried from the start screen's Adjust Focus
  // modal via query params (?interviewType=…&topic=…).
  const interviewType =
    typeof sp.interviewType === "string" ? sp.interviewType : undefined;
  const specificTopic = typeof sp.topic === "string" ? sp.topic : undefined;
  const focusOverride: SessionFocusOverride | undefined =
    interviewType || specificTopic
      ? { interviewType, specificTopic }
      : undefined;

  return <InterviewSession sessionId={sessionId} focusOverride={focusOverride} />;
}

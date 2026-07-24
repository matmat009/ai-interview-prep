import { SessionReviewView } from "@/features/history/components/SessionReviewView";

export default async function SessionReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <SessionReviewView sessionId={sessionId} />;
}

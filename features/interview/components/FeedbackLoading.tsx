import { ThinkingIndicator } from "@/components/thinking-indicator";

const FEEDBACK_STATUSES = [
  "Reading your answer...",
  "Evaluating your response...",
  "Preparing feedback...",
];

// Loading card shared by feedback generation (default statuses) and question
// generation (pass question-appropriate statuses). Same card wrapper as
// AnswerInput/FeedbackPanel so swapping it in doesn't shift width/position.
export function FeedbackLoading({
  statuses = FEEDBACK_STATUSES,
}: {
  statuses?: string[];
} = {}) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <ThinkingIndicator statuses={statuses} />
    </div>
  );
}

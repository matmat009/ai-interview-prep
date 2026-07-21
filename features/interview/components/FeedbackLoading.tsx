import { ThinkingIndicator } from "@/components/thinking-indicator";

const STATUSES = [
  "Reading your answer...",
  "Evaluating your response...",
  "Preparing feedback...",
];

export function FeedbackLoading() {
  return (
    // Same card wrapper as AnswerInput/FeedbackPanel so replacing it doesn't
    // shift width/position.
    <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <ThinkingIndicator statuses={STATUSES} />
    </div>
  );
}

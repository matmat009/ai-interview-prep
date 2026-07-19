// Displays the current interview question with a progress indicator, styled to
// match the onboarding wizard's progress bar and the glass cards elsewhere.
export function QuestionCard({
  index,
  total,
  question,
}: {
  index: number;
  total: number;
  question: string;
}) {
  const current = index + 1;
  const progress = (current / total) * 100;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium text-primary">
          Question {current} of {total}
        </span>
        <span className="tabular-nums">{Math.round(progress)}%</span>
      </div>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h1 className="mt-6 text-xl leading-snug font-semibold tracking-tight text-balance sm:text-2xl">
        {question}
      </h1>
    </div>
  );
}

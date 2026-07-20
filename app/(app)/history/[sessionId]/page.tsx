import Link from "next/link";

export default async function SessionReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
      <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Session review
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Coming soon
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">Session ID</p>
        <code className="mt-1 inline-block max-w-full truncate rounded-md bg-muted px-3 py-1.5 font-mono text-sm text-foreground">
          {sessionId}
        </code>
        <div className="mt-6">
          <Link
            href="/history"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to History
          </Link>
        </div>
      </div>
    </div>
  );
}

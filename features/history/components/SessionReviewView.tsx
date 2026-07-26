"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, RotateCcw, Trash2, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteSession,
  fetchSession,
  hasUsedTodaysAction,
  toDisplaySession,
  type SessionItem,
  type SessionRow,
} from "@/features/history/sessions";
import { formatSessionDate } from "@/features/history/components/SessionCard";
import { DeleteSessionDialog } from "@/features/history/components/DeleteSessionDialog";

export function SessionReviewView({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [row, setRow] = useState<SessionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [usedToday, setUsedToday] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const [found, used] = await Promise.all([
          fetchSession(supabase, sessionId),
          user
            ? hasUsedTodaysAction(supabase, user.id)
            : Promise.resolve(false),
        ]);
        if (!active) return;
        setRow(found);
        setUsedToday(used);
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [sessionId]);

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      await deleteSession(supabase, sessionId);
      router.push("/history");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e));
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Loading session…</p>
      </Shell>
    );
  }

  if (error || !row) {
    return (
      <Shell>
        <h1 className="text-lg font-semibold">Session not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {error ?? "We couldn't find a review for this session."}
        </p>
        <Link
          href="/history"
          className="mt-6 inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Back to History
        </Link>
      </Shell>
    );
  }

  const display = toDisplaySession(row);
  const inProgress = row.status === "in-progress";
  const items: SessionItem[] = (row.items ?? [])
    .slice()
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
      <div className="my-auto flex w-full max-w-2xl flex-col gap-4">
        <Link
          href="/history"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to History
        </Link>

        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 shadow-lg shadow-primary/30 ring-1 ring-white/15">
            <Trophy className="size-7 text-white" strokeWidth={1.75} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {display.role} · {display.focus} · {formatSessionDate(display.date)}
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
            {display.score !== null ? `${display.score}%` : "—"}
          </p>
          <p className="mt-1 text-sm font-medium text-primary">
            {display.status}
          </p>
        </div>

        {/* Answered questions */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-card/40 p-8 text-center backdrop-blur">
            <p className="text-sm text-muted-foreground">
              No questions were answered in this session yet.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-card/60 p-2 shadow-2xl backdrop-blur-xl">
            <div className="px-3 py-2">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Question recap
              </span>
            </div>
            <ul>
              {items.map((item, i) => {
                const open = expanded === i;
                return (
                  <li key={item.order} className="border-b border-white/5 last:border-0">
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
                        {item.order}
                      </span>
                      <span className={`flex-1 text-sm ${open ? "" : "truncate"}`}>
                        {item.question}
                      </span>
                      {typeof item.feedback?.score === "number" && (
                        <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                          {item.feedback.score}%
                        </span>
                      )}
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {open && (
                      <div className="space-y-3 px-3 pb-4 pl-12">
                        <div>
                          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Your answer
                          </p>
                          <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                            {item.answer || "No answer recorded."}
                          </p>
                        </div>
                        {item.feedback?.summary && (
                          <div>
                            <p className="text-xs font-medium tracking-wide text-primary uppercase">
                              Feedback
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {item.feedback.summary}
                            </p>
                          </div>
                        )}
                        {item.feedback?.strengths?.length > 0 && (
                          <Bullets
                            title="Strengths"
                            items={item.feedback.strengths}
                            tone="positive"
                          />
                        )}
                        {item.feedback?.improvements?.length > 0 && (
                          <Bullets
                            title="Areas to improve"
                            items={item.feedback.improvements}
                            tone="accent"
                          />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Actions — below the recap. */}
        <div className="flex items-center justify-end gap-2">
          {inProgress &&
            (usedToday ? (
              <span className="text-xs text-muted-foreground">
                Continue available tomorrow
              </span>
            ) : (
              <Button
                nativeButton={false}
                render={<Link href={`/interview/${sessionId}`} />}
              >
                <RotateCcw />
                Continue session
              </Button>
            ))}
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <DeleteSessionDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setConfirmOpen(open);
            if (!open) setDeleteError(null);
          }
        }}
        label={display.role}
        deleting={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function Bullets({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "accent";
}) {
  const isPositive = tone === "positive";
  return (
    <div>
      <p
        className={`text-xs font-medium tracking-wide uppercase ${
          isPositive ? "text-emerald-400" : "text-primary"
        }`}
      >
        {title}
      </p>
      <ul className="mt-1 space-y-1.5">
        {items.map((text, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
          >
            <span
              className={`mt-2 size-1.5 shrink-0 rounded-full ${
                isPositive ? "bg-emerald-400" : "bg-primary"
              }`}
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
      <div className="my-auto w-full max-w-md rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}

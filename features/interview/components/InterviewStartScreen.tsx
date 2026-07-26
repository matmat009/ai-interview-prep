"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  MessageSquare,
  Mic,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchInProgressSession,
  hasUsedTodaysAction,
} from "@/features/history/sessions";
import type { OnboardingAnswers, SessionFocusOverride } from "@/types/interview";
import { AdjustFocusModal } from "@/features/interview/components/AdjustFocusModal";

export function InterviewStartScreen() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [profile, setProfile] = useState<OnboardingAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  // One action per day (start OR continue); and the most recent unfinished
  // session to resume, if any.
  const [usedToday, setUsedToday] = useState(false);
  const [continueId, setContinueId] = useState<string | null>(null);

  const blocked = usedToday;

  // Per-session focus override; empty until the user adjusts it.
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusOverride, setFocusOverride] = useState<SessionFocusOverride>({});

  // Load the signed-in user's profile. Defensive: bounce to /onboarding if
  // there's no completed profile (shouldn't happen — onboarding is required).
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (!data || !data.onboarding_completed) {
        router.replace("/onboarding");
        return;
      }
      // Daily allowance + resume target. The allowance is only checked here and
      // again in handleStart (never mid-session), so an in-progress session can
      // always be finished, even past midnight.
      const [used, inProgress] = await Promise.all([
        hasUsedTodaysAction(supabase, user.id),
        fetchInProgressSession(supabase, user.id),
      ]);
      if (!active) return;
      setUsedToday(used);
      setContinueId(inProgress?.id ?? null);

      setProfile({
        role: data.role ?? "",
        experience: data.experience ?? "",
        interviewType: data.interview_type ?? "",
        timeline: data.timeline ?? "",
        companies: data.companies ?? "",
        concerns: data.concerns ?? "",
      });
      // Single gate for profile + limit, so the Start button never flashes
      // before we know whether they're allowed to start.
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  // Effective focus: the session override wins, else the profile's type.
  const interviewType =
    focusOverride.interviewType ?? profile?.interviewType ?? "";
  const topic = focusOverride.specificTopic ?? "";
  const focusValue = topic ? `${interviewType} · ${topic}` : interviewType;

  const summary = [
    { icon: Briefcase, label: "Role", value: profile?.role ?? "" },
    { icon: TrendingUp, label: "Experience", value: profile?.experience ?? "" },
    { icon: Target, label: "Focus", value: focusValue },
  ];

  async function handleStart() {
    setStartError(null);
    setStarting(true);

    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStartError("You need to be signed in to start a session.");
      setStarting(false);
      return;
    }

    // Re-check right before creating the row — closes the race where a tab left
    // open (which passed the mount-time check) used its action elsewhere in the
    // meantime (started or continued a session in another tab).
    const alreadyUsed = await hasUsedTodaysAction(supabase, user.id);
    if (alreadyUsed) {
      setUsedToday(true); // flips `blocked` -> shows the "come back tomorrow" block
      setStarting(false);
      return;
    }

    const sessionId = crypto.randomUUID();
    const hasOverride = Boolean(
      focusOverride.interviewType || focusOverride.specificTopic,
    );

    const { error } = await supabase.from("sessions").insert({
      id: sessionId,
      user_id: user.id,
      role: profile?.role || null,
      focus_override: hasOverride ? focusOverride : null,
      items: [],
      status: "in-progress",
    });

    if (error) {
      setStartError(error.message);
      setStarting(false);
      return;
    }

    // Carry the focus override into the session so its questions reflect it.
    const query = new URLSearchParams();
    if (focusOverride.interviewType) {
      query.set("interviewType", focusOverride.interviewType);
    }
    if (focusOverride.specificTopic) {
      query.set("topic", focusOverride.specificTopic);
    }
    const qs = query.toString();
    router.push(`/interview/${sessionId}${qs ? `?${qs}` : ""}`);
  }

  // Brief loading state while the profile + today's session count are fetched.
  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        {/* Illustration */}
        <div className="relative mb-9">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-full bg-primary/25 blur-2xl"
          />
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 shadow-lg shadow-primary/30 ring-1 ring-white/15">
            <Mic className="size-9 text-white" strokeWidth={1.75} />
          </div>
          <div className="absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-lg border border-white/10 bg-card/80 shadow-md backdrop-blur-md">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="absolute -bottom-3 -left-3 flex size-8 items-center justify-center rounded-lg border border-white/10 bg-card/80 shadow-md backdrop-blur-md">
            <MessageSquare className="size-4 text-fuchsia-400" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Ready to practice your interview?
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground text-balance">
          We&apos;ll tailor each question to your focus area. Take your time —
          you can pause whenever you need.
        </p>

        {/* Summary card — glass treatment for contrast over the gradient */}
        <div className="mt-9 w-full overflow-hidden rounded-2xl border border-white/10 bg-card/60 text-left shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-5 py-3">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Your session focus
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {summary.map((row) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <row.icon className="size-4" />
                </span>
                <span className="text-sm text-muted-foreground">
                  {row.label}
                </span>
                <span className="ml-auto text-right text-sm font-medium text-foreground">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {startError && (
          <p className="mt-6 w-full rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {startError}
          </p>
        )}

        {/* Actions — replaced by the daily-limit notice once today's session is used */}
        {blocked ? (
          <div className="mt-9 w-full rounded-xl border border-white/10 bg-card/60 px-5 py-4 text-center shadow-lg backdrop-blur-xl">
            <p className="text-sm font-medium text-foreground">
              You&apos;ve used today&apos;s practice session.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Come back tomorrow for your next one.
            </p>
          </div>
        ) : (
          <div className="mt-9 flex w-full flex-col items-center gap-4">
            {continueId && (
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href={`/interview/${continueId}`} />}
                className="group w-full px-8 sm:w-auto"
              >
                <RotateCcw />
                Continue where you left off
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleStart}
              disabled={starting}
              className="group w-full px-8 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 sm:w-auto"
            >
              {starting ? "Starting…" : "Start Interview"}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            {continueId && (
              <p className="max-w-xs text-xs text-muted-foreground text-balance">
                Continuing or starting uses today&apos;s session — pick one.
              </p>
            )}
            <button
              type="button"
              onClick={() => setFocusOpen(true)}
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Adjust focus
            </button>
          </div>
        )}
      </div>

      <AdjustFocusModal
        open={focusOpen}
        onOpenChange={setFocusOpen}
        value={{ interviewType, specificTopic: topic }}
        onSave={setFocusOverride}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  MessageSquare,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OnboardingAnswers, SessionFocusOverride } from "@/types/interview";
import { AdjustFocusModal } from "@/features/interview/components/AdjustFocusModal";

// One new interview session per user per day.
const DAILY_SESSION_LIMIT = 1;

// Sessions the user created in the current UTC day — the daily-limit measure.
// Uses the UTC-day boundary so the client agrees with the DB trigger, which
// counts by UTC calendar day.
async function countSessionsToday(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  userId: string,
): Promise<number> {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", startOfToday.toISOString());
  return (data ?? []).length;
}

export function InterviewStartScreen() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [profile, setProfile] = useState<OnboardingAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionsToday, setSessionsToday] = useState(0);

  const blocked = sessionsToday >= DAILY_SESSION_LIMIT;

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
      // Daily rate limit — count sessions created in the current UTC day. The
      // limit is only checked here and again in handleStart (never mid-session),
      // so an in-progress session can always be finished, even past midnight.
      const count = await countSessionsToday(supabase, user.id);
      if (!active) return;
      setSessionsToday(count);

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
    // open (which passed the mount-time check) could exceed the limit if another
    // session was completed elsewhere in the meantime.
    const usedToday = await countSessionsToday(supabase, user.id);
    if (usedToday >= DAILY_SESSION_LIMIT) {
      setSessionsToday(usedToday); // flips `blocked` -> shows the same message
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
          <div className="mt-9 flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={starting}
              className="group w-full px-8 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 sm:w-auto"
            >
              {starting ? "Starting…" : "Start Interview"}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
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

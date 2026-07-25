"use client";

import { useEffect, useRef, useState } from "react";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  EMPTY_ONBOARDING_ANSWERS,
  type OnboardingAnswers,
} from "@/types/onboarding";
import { CompaniesStep } from "@/features/onboarding/steps/CompaniesStep";
import { ConcernsStep } from "@/features/onboarding/steps/ConcernsStep";
import { ExperienceStep } from "@/features/onboarding/steps/ExperienceStep";
import { InterviewTypeStep } from "@/features/onboarding/steps/InterviewTypeStep";
import { RoleStep } from "@/features/onboarding/steps/RoleStep";
import { TimelineStep } from "@/features/onboarding/steps/TimelineStep";

export function InterviewProfileSection() {
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    EMPTY_ONBOARDING_ANSWERS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (active) {
            setError("Sign in to edit your interview profile.");
            setLoading(false);
          }
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (!active) return;
        if (data) {
          setAnswers({
            role: data.role ?? "",
            experience: data.experience ?? "",
            interviewType: data.interview_type ?? "",
            timeline: data.timeline ?? "",
            companies: data.companies ?? "",
            concerns: data.concerns ?? "",
          });
        }
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  function update(key: keyof OnboardingAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);

    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You need to be signed in to save changes.");
      setSaving(false);
      return;
    }

    const { error: saveError } = await supabase.from("profiles").upsert({
      id: user.id,
      role: answers.role,
      experience: answers.experience,
      interview_type: answers.interviewType,
      timeline: answers.timeline,
      companies: answers.companies,
      concerns: answers.concerns,
      // onboarding_completed is intentionally omitted — editing settings must
      // never reset or change whether onboarding was completed.
    });

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }

    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <header>
        <p className="text-sm text-muted-foreground">
          These answers shape the questions and feedback in your sessions.
        </p>
      </header>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Loading your profile…
        </p>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-10">
            <RoleStep
              value={answers.role}
              onChange={(v) => update("role", v)}
            />
            <ExperienceStep
              value={answers.experience}
              onChange={(v) => update("experience", v)}
            />
            <InterviewTypeStep
              value={answers.interviewType}
              onChange={(v) => update("interviewType", v)}
            />
            <TimelineStep
              value={answers.timeline}
              onChange={(v) => update("timeline", v)}
            />
            <CompaniesStep
              value={answers.companies}
              onChange={(v) => update("companies", v)}
            />
            <ConcernsStep
              value={answers.concerns}
              onChange={(v) => update("concerns", v)}
            />
          </div>

          {error && (
            <p className="mt-8 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-end gap-4">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <Check className="size-4" />
                Saved
              </span>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

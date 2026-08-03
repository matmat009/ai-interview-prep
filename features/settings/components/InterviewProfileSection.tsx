"use client";

import { useEffect, useRef, useState } from "react";

import { Briefcase, Check, NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toastSuccess } from "@/components/ui/sonner";
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
  // Role the profile loaded with — used to clear cached Question Bank
  // categories when the role changes so they regenerate for the new role.
  const initialRoleRef = useRef("");

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
          initialRoleRef.current = data.role ?? "";
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

    const roleChanged = answers.role.trim() !== initialRoleRef.current.trim();

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
      // Role change → drop cached Question Bank categories so they regenerate
      // for the new role on the next Question Bank visit.
      ...(roleChanged ? { question_bank_categories: null } : {}),
    });

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }

    // Saved role is now the baseline for detecting the next change.
    initialRoleRef.current = answers.role;
    setSaved(true);
    toastSuccess("Settings saved", "Your interview profile is up to date.");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="w-full max-w-3xl">
      <p className="text-sm text-muted-foreground">
        These answers shape the questions and feedback in your sessions.
      </p>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">
            Loading your profile…
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-6">
            {/* Your Profile — the essentials every question is built from. */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-card/60 shadow-2xl backdrop-blur-xl">
              <header className="flex items-center gap-3 border-b border-white/5 px-6 py-4 sm:px-7">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    Your Profile
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    The essentials that shape every question.
                  </p>
                </div>
              </header>
              <div className="divide-y divide-white/5">
                <div className="px-6 py-6 sm:px-7">
                  <RoleStep
                    value={answers.role}
                    onChange={(v) => update("role", v)}
                  />
                </div>
                <div className="px-6 py-6 sm:px-7">
                  <ExperienceStep
                    value={answers.experience}
                    onChange={(v) => update("experience", v)}
                  />
                </div>
                <div className="px-6 py-6 sm:px-7">
                  <InterviewTypeStep
                    value={answers.interviewType}
                    onChange={(v) => update("interviewType", v)}
                  />
                </div>
              </div>
            </section>

            {/* Additional Context — optional details that fine-tune practice. */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-card/60 shadow-2xl backdrop-blur-xl">
              <header className="flex items-center gap-3 border-b border-white/5 px-6 py-4 sm:px-7">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <NotebookPen className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    Additional Context
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Optional details that fine-tune your sessions.
                  </p>
                </div>
              </header>
              <div className="divide-y divide-white/5">
                <div className="px-6 py-6 sm:px-7">
                  <TimelineStep
                    value={answers.timeline}
                    onChange={(v) => update("timeline", v)}
                  />
                </div>
                <div className="px-6 py-6 sm:px-7">
                  <CompaniesStep
                    value={answers.companies}
                    onChange={(v) => update("companies", v)}
                  />
                </div>
                <div className="px-6 py-6 sm:px-7">
                  <ConcernsStep
                    value={answers.concerns}
                    onChange={(v) => update("concerns", v)}
                  />
                </div>
              </div>
            </section>
          </div>

          {error && (
            <p className="mt-6 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-4">
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
    </div>
  );
}

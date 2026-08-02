"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  OnboardingAnswers,
  QuestionBankCategory,
} from "@/types/interview";
import {
  QUESTION_BANK_DAILY_LIMIT,
  consumeQuestionBankUsage,
  fetchQuestionBankUsage,
} from "@/features/question-bank/usage";
import { QuestionBankSession } from "@/features/question-bank/components/QuestionBankSession";

// Cached categories come back as jsonb — validate before trusting them.
function isValidCategories(v: unknown): v is QuestionBankCategory[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (c) =>
        !!c &&
        typeof c === "object" &&
        typeof (c as { title?: unknown }).title === "string" &&
        ((c as { title: string }).title.trim() !== ""),
    )
  );
}

export default function QuestionBankPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<OnboardingAnswers | null>(null);
  const [used, setUsed] = useState(0);
  const [categories, setCategories] = useState<QuestionBankCategory[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true); // profile + usage bootstrap
  const [catLoading, setCatLoading] = useState(false); // generating categories
  const [catError, setCatError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

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
      const prof: OnboardingAnswers = {
        role: data.role ?? "",
        experience: data.experience ?? "",
        interviewType: data.interview_type ?? "",
        timeline: data.timeline ?? "",
        companies: data.companies ?? "",
        concerns: data.concerns ?? "",
      };
      const count = await fetchQuestionBankUsage(supabase, user.id);
      if (!active) return;
      setUserId(user.id);
      setProfile(prof);
      setUsed(count);
      setLoading(false);

      // Categories: use the cache if present (no Gemini call); otherwise
      // generate — but skip generation when already capped, since the picker
      // won't be usable today anyway.
      if (isValidCategories(data.question_bank_categories)) {
        setCategories(data.question_bank_categories);
      } else if (count < QUESTION_BANK_DAILY_LIMIT) {
        void generateAndCache(prof.role, user.id);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function generateAndCache(role: string, uid: string) {
    setCatError(null);
    setCatLoading(true);
    try {
      const res = await fetch("/api/generate-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(d?.error || `Request failed (${res.status}).`);
      }
      const { categories: cats } = (await res.json()) as {
        categories: QuestionBankCategory[];
      };
      setCategories(cats);
      // Cache for next time so we don't regenerate on every visit.
      const supabase = getSupabaseBrowserClient();
      await supabase
        .from("profiles")
        .update({ question_bank_categories: cats })
        .eq("id", uid);
    } catch (e) {
      setCatError(e instanceof Error ? e.message : String(e));
    } finally {
      setCatLoading(false);
    }
  }

  const remaining = QUESTION_BANK_DAILY_LIMIT - used;

  async function handleConsume() {
    const supabase = getSupabaseBrowserClient();
    setUsed(await consumeQuestionBankUsage(supabase));
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (category && profile) {
    return (
      <QuestionBankSession
        category={category}
        profile={profile}
        remaining={remaining}
        onConsume={handleConsume}
        onExit={() => setCategory(null)}
      />
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pick a category to practice
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quick, on-demand practice, tailored to your role, one question at a time.
          {remaining > 0 &&
            ` ${remaining} of ${QUESTION_BANK_DAILY_LIMIT} left today.`}
        </p>

        {remaining <= 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-medium text-foreground">
              You&apos;ve used today&apos;s practice questions.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Come back tomorrow for more.
            </p>
          </div>
        ) : catLoading ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-card/60 p-8 text-center shadow-2xl backdrop-blur-xl">
            <p className="text-sm text-muted-foreground">
              Tailoring practice categories to your role…
            </p>
          </div>
        ) : catError ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <TriangleAlert className="size-6" />
              </div>
              <div>
                <p className="font-medium">Couldn&apos;t load categories</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {catError}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (profile && userId)
                    void generateAndCache(profile.role, userId);
                }}
              >
                <RotateCcw />
                Try again
              </Button>
            </div>
          </div>
        ) : categories ? (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((c) => (
              <button
                key={c.title}
                type="button"
                onClick={() => setCategory(c.title)}
                className="flex flex-col items-start gap-1 rounded-xl border border-white/10 bg-card/60 p-4 text-left shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="text-sm font-medium text-foreground">
                  {c.title}
                </span>
                {c.description && (
                  <span className="text-xs text-muted-foreground">
                    {c.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toastSuccess } from "@/components/ui/sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return setEmailError("Email is required.");
    if (!EMAIL_RE.test(email))
      return setEmailError("Enter a valid email address.");
    setEmailError(null);
    setSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    // Result intentionally ignored so we never reveal whether the account exists.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    setSent(true);
    toastSuccess(
      "Reset link sent",
      "Check your email for a link to reset your password.",
    );
  }

  return (
    <Card className="border border-white/10 bg-[#0d0d0f] shadow-[0_20px_80px_-40px_rgba(124,58,237,0.5)] ring-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Reset your password
        </CardTitle>
        <CardDescription className="text-white/50">
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {sent ? (
          <p className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            If an account exists for that email, we&apos;ve sent a reset link.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-white/70">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={!!emailError}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError(null);
                }}
                className="text-white placeholder:text-white/30"
              />
              {emailError && <p className="text-xs text-red-400">{emailError}</p>}
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full bg-violet-600 text-white hover:bg-violet-500"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-white/50">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 transition-colors hover:text-violet-300"
          >
            Back to login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

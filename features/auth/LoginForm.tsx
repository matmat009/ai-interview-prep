"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { destinationForUser } from "@/features/auth/post-auth-redirect";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OAUTH_ERROR =
  "Something went wrong signing in with Google. Please try again.";

type Errors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const reset = params.get("reset");
    // OAuth callback failures redirect here with ?error=oauth; a completed
    // password reset redirects here with ?reset=success.
    if (error === "oauth") setFormError(OAUTH_ERROR);
    if (reset === "success") setNotice("Password updated, please sign in.");
    if (error || reset) {
      // Drop the param so a refresh doesn't keep re-showing the banner.
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  function validate(): Errors {
    const next: Errors = {};
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }

    // Route by onboarding status — shared with the OAuth callback so the rule
    // lives in one place.
    const userId = data.user?.id;
    const dest = userId
      ? await destinationForUser(supabase, userId)
      : "/onboarding";
    router.push(dest);
  }

  return (
    <Card className="border border-white/10 bg-[#0d0d0f] shadow-[0_20px_80px_-40px_rgba(124,58,237,0.5)] ring-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-white/50">
          Log in to continue your interview prep.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {notice && (
          <p className="mb-4 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {notice}
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
              aria-invalid={!!errors.email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="text-white placeholder:text-white/30"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/70">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              aria-invalid={!!errors.password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className="text-white placeholder:text-white/30"
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {formError && (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full bg-violet-600 text-white hover:bg-violet-500"
          >
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <GoogleSignInButton />
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-400 transition-colors hover:text-violet-300"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

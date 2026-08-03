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
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toastSuccess } from "@/components/ui/sonner";

type Errors = { password?: string; confirmPassword?: string };
type Status = "verifying" | "ready" | "invalid";

const CARD_CLASS =
  "border border-white/10 bg-[#0d0d0f] shadow-[0_20px_80px_-40px_rgba(124,58,237,0.5)] ring-0";

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Exchange the recovery code from the email link for a session so the update
  // is authorized. Works for Google-only accounts too — they just set a
  // password for the first time; no special-casing needed.
  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowserClient();
      // PKCE flow puts a code in the query; the implicit/recovery flow puts the
      // tokens in the URL hash (#access_token=…&refresh_token=…&type=recovery).
      const code = new URLSearchParams(window.location.search).get("code");
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let ok = false;
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        ok = !error;
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        ok = !error;
      } else {
        setStatus("invalid");
        return;
      }

      setStatus(ok ? "ready" : "invalid");
      // Strip the code/tokens from the URL so they don't linger or re-run.
      window.history.replaceState(null, "", window.location.pathname);
    })();
  }, []);

  function validate(): Errors {
    const next: Errors = {};
    if (!password) next.password = "Password is required.";
    if (!confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (password && password !== confirmPassword)
      next.confirmPassword = "Passwords do not match.";
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
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }
    toastSuccess("Password updated", "Sign in with your new password.");
    // Sign the recovery session out so the user logs in fresh with the new
    // password (and middleware doesn't redirect them off /login).
    await supabase.auth.signOut();
    router.push("/login?reset=success");
  }

  if (status === "verifying") {
    return (
      <Card className={CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Reset password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/50">Verifying your reset link…</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "invalid") {
    return (
      <Card className={CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Link expired
          </CardTitle>
          <CardDescription className="text-white/50">
            This reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            Please request a new password reset link.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-violet-400 transition-colors hover:text-violet-300"
          >
            Request a new link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={CARD_CLASS}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Set a new password
        </CardTitle>
        <CardDescription className="text-white/50">
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-white/70">
              New password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword" className="text-white/70">
              Confirm new password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              aria-invalid={!!errors.confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
              }}
              className="text-white placeholder:text-white/30"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">{errors.confirmPassword}</p>
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
            {submitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

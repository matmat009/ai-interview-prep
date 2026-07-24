"use client";

import { useState } from "react";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
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
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }

    // New users always onboard first.
    router.push("/onboarding");
  }

  return (
    <Card className="border border-white/10 bg-[#0d0d0f] shadow-[0_20px_80px_-40px_rgba(124,58,237,0.5)] ring-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Create your account
        </CardTitle>
        <CardDescription className="text-white/50">
          Start running AI mock interviews in minutes.
        </CardDescription>
      </CardHeader>

      <CardContent>
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
            <Label htmlFor="password" className="text-white/70">
              Password
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
              Confirm password
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
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-white/50">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 transition-colors hover:text-violet-300"
          >
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

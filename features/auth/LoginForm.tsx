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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Dummy credentials for local testing only — no Supabase yet.
const DEMO_EMAIL = "test@test.com";
const DEMO_PASSWORD = "test1234";

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
  const [loggedIn, setLoggedIn] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setLoggedIn(false);

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Dummy authentication for local testing only — no Supabase yet.
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setLoggedIn(true);
      console.log("login success", { email });

      // TEMPORARY — REPLACE WITH SUPABASE CHECK LATER.
      // Hardcoded onboarding status; the real check will read the user's profile.
      const hasCompletedOnboarding = false;

      router.push(hasCompletedOnboarding ? "/interview" : "/onboarding");
    } else {
      setFormError("Invalid email or password.");
      console.log("login failed", { email });
    }
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
          {loggedIn && (
            <p className="rounded-md border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-300">
              Logged in successfully.
            </p>
          )}

          <Button
            type="submit"
            className="mt-2 w-full bg-violet-600 text-white hover:bg-violet-500"
          >
            Log in
          </Button>
        </form>
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

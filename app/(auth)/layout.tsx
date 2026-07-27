import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0b] px-6 py-12"
      // Scope the accent (focus rings on Inputs/Buttons) to the landing-page violet.
      style={{ "--ring": "oklch(0.606 0.25 292.717)" } as React.CSSProperties}
    >
      {/* Understated purple radial glow, echoing the hero without dominating. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-72 w-[70%] max-w-2xl -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.22),transparent)] blur-2xl"
      />

      <Link
        href="/"
        className="relative z-10 mb-8 flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <LogoMark className="size-5" />
        <span className="text-[15px] font-semibold tracking-tight text-white">
          PrepPilot
        </span>
      </Link>

      <main className="relative z-10 w-full max-w-sm">{children}</main>
    </div>
  );
}

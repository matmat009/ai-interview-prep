import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo-mark";
import { LandingGradientBackgroundBottom } from "@/components/landing/LandingGradientBackgroundBottom";

// Closing section for the landing page. Hosts the bottom "Spectral Gradient
// (Darks)" wash (scoped inside this footer's box, so it can't bleed into FAQ),
// with a final CTA and minimal meta. Content sits at z-10 above the z-0 wash.
export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/[0.06] px-6 pt-24 pb-14 sm:pt-32">
      <LandingGradientBackgroundBottom />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-start gap-5">
          <h2 className="max-w-xl font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.02em] text-white text-balance sm:text-4xl">
            Ready when you are.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/55 text-pretty">
            Set up in about a minute, then take your first mock interview today.
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/signup" />}
            className="mt-1 h-11 rounded-xl px-5 duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] active:translate-y-0 active:scale-[0.98]"
          >
            Start practicing
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="size-5" />
            <span className="text-[15px] font-semibold tracking-tight text-white">
              PrepPilot
            </span>
          </div>
          <p className="text-xs text-white/40">
            © 2026 PrepPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

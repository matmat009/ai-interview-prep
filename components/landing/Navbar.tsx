"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo-mark";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // Same reduced-motion pattern as the hero entrance.
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      // Drops into place from above — mirrors the hero sliding up from below.
      // Framer drives transform/opacity, so the CSS transition below is narrowed
      // to just the scroll-state props (bg/border/blur) to avoid fighting it.
      initial={{ opacity: 0, y: reduce ? 0 : -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.25 : 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 transition-[background-color,border-color,backdrop-filter] duration-300 ease-out sm:px-10 ${
        scrolled
          ? "border-b border-white/10 bg-[#0a0a0b]/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent backdrop-blur-none"
      }`}
    >
      <div className="flex items-center gap-8">
        <a href="#" className="flex items-center gap-2">
          <LogoMark className="size-5" />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            PrepPilot
          </span>
        </a>
      </div>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
        <NavItem hasChevron>Getting started</NavItem>
        <NavItem hasChevron>Features</NavItem>
        <NavItem>Documentation</NavItem>
      </nav>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden text-sm text-white/70 transition-colors hover:text-white sm:block"
        >
          Sign in
        </Link>
        <Button
          size="sm"
          className="px-4"
          nativeButton={false}
          render={<Link href="/signup" />}
        >
          Get started
        </Button>
      </div>
    </motion.header>
  );
}

function NavItem({
  children,
  hasChevron,
}: {
  children: React.ReactNode;
  hasChevron?: boolean;
}) {
  return (
    <a
      href="#"
      className="flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
    >
      {children}
      {hasChevron && <ChevronDown className="size-4 text-white/40" />}
    </a>
  );
}

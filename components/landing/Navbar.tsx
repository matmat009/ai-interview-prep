"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ChevronDown, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 transition-all duration-300 ease-out sm:px-10 ${
        scrolled
          ? "border-b border-white/10 bg-[#0a0a0b]/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent backdrop-blur-none"
      }`}
    >
      <div className="flex items-center gap-8">
        <a href="#" className="flex items-center gap-2">
          <Sparkles className="size-5 text-white" strokeWidth={2.25} />
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
    </header>
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

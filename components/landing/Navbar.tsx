"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo-mark";

// Plain in-page links; each smooth-scrolls to its matching section id.
const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "how-it-works", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // Mobile menu open state. Only ever visible below md — the hamburger and the
  // panel are both `md:hidden`, so this has no effect on desktop.
  const [open, setOpen] = useState(false);
  // Same reduced-motion pattern as the hero entrance.
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Smooth-scroll to a section. scrollIntoView respects each section's
  // scroll-mt-* (scroll-margin-top), so targets clear the fixed nav. Instant
  // jump under reduced-motion.
  function handleNav(event: React.MouseEvent, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <>
      {/* Tap-outside-to-close backdrop. Above page content but BELOW the header
          (z-20), so the hamburger + panel stay on top and tappable. Mobile only
          and only while open. Subtle dim, no blur/glow. */}
      <AnimatePresence>
        {open && (
          <motion.div
            aria-hidden
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[15] bg-black/40 md:hidden"
          />
        )}
      </AnimatePresence>

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
        <a
          href="#home"
          onClick={(e) => handleNav(e, "home")}
          className="flex items-center gap-2"
        >
          <LogoMark className="size-5" />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            PrepPilot
          </span>
        </a>
      </div>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => handleNav(e, link.id)}
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        {/* Desktop (md+): sign in + get started stay inline, unchanged. */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm text-white/70 transition-colors hover:text-white"
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

        {/* Mobile (below md): a single hamburger toggle. */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex size-9 items-center justify-center rounded-lg border border-white/12 bg-white/[0.03] text-white/80 outline-none transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu panel — drops below the bar. md:hidden, so desktop never
          renders it regardless of `open`. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: reduce ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: reduce ? 0.15 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full border-b border-white/10 bg-[#0a0a0b]/70 backdrop-blur-xl backdrop-saturate-150 md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4 sm:px-10">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    handleNav(e, link.id);
                    setOpen(false);
                  }}
                  className="rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="my-2 h-px bg-white/10" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
              <Button
                size="sm"
                className="mt-1 w-full px-4"
                nativeButton={false}
                render={
                  <Link href="/signup" onClick={() => setOpen(false)} />
                }
              >
                Get started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
}

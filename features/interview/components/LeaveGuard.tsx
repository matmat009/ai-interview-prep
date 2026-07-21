"use client";

import { useEffect, useRef, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Guards against leaving an in-progress interview session.
 *
 * - `beforeunload` covers browser-level exits (tab close, refresh, navigating
 *   to another site, browser back that unloads the page). Browsers show their
 *   own generic prompt — custom wording isn't supported.
 * - A capture-phase click interceptor covers in-app Next.js navigation (sidebar
 *   links etc.), which `beforeunload` never sees, and shows a custom dialog.
 *
 * Both are only wired up while `active` is true, and are torn down when `active`
 * flips to false (session finished) or the component unmounts.
 */
export function LeaveGuard({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const bypassRef = useRef(false);

  // Browser-level exits.
  useEffect(() => {
    if (!active) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Required for the prompt to show across browsers.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);

  // In-app link clicks that navigate away from this session page.
  useEffect(() => {
    if (!active) return;

    function onClick(event: MouseEvent) {
      if (bypassRef.current) return;
      if (event.defaultPrevented) return;
      // Ignore non-primary clicks and modified clicks (new tab / download etc.).
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      // Only intercept same-origin navigations to a different path.
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname) return;

      // Block the browser default and the Next.js Link handler, then confirm.
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
    }

    document.addEventListener("click", onClick, true); // capture phase
    return () => document.removeEventListener("click", onClick, true);
  }, [active, pathname]);

  function confirmLeave() {
    const href = pendingHref;
    setPendingHref(null);
    if (!href) return;
    bypassRef.current = true; // allow the programmatic navigation through
    router.push(href);
  }

  return (
    <Dialog
      open={pendingHref !== null}
      onOpenChange={(open) => {
        if (!open) setPendingHref(null);
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Leave this interview?</DialogTitle>
          <DialogDescription>
            Your session is still in progress. If you leave now, your answers and
            feedback for this session will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPendingHref(null)}>
            Stay
          </Button>
          <Button variant="destructive" onClick={confirmLeave}>
            Leave session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

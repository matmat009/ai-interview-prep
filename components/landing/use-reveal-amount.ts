"use client";

import { useEffect, useState } from "react";

// Viewport `amount` (fraction of the TARGET element that must be visible) for
// the sections' scroll-reveal trigger — responsive on purpose.
//
// Why: `amount` is measured against the target element, not the viewport. On
// desktop these sections are multi-column and shorter than the viewport, so a
// higher threshold (fires when the section is comfortably in view) reads well.
// On mobile the grids collapse to a single tall column that can exceed the
// viewport height — at which point 40% of the element can NEVER be on screen at
// once, so `whileInView` never fires and the section stays stuck at opacity:0
// (renders blank). Mobile therefore needs a low, always-satisfiable threshold.
//
// Defaults to the mobile-safe value so SSR and the first client paint are always
// safe; only bumps to the desktop value once the `md` breakpoint is confirmed.
const DESKTOP_AMOUNT = 0.4;
const MOBILE_AMOUNT = 0.2;

export function useRevealAmount() {
  const [amount, setAmount] = useState(MOBILE_AMOUNT);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)"); // Tailwind `md`
    const update = () => setAmount(mq.matches ? DESKTOP_AMOUNT : MOBILE_AMOUNT);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return amount;
}

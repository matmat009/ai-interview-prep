// ============================================================================
// "Spectral Gradient (Darks)"
// ----------------------------------------------------------------------------
// Landing-only ambient background. Reuses the app's three brand hex colors
// (see components/layout/GradientBackground.tsx and
// features/onboarding/OnboardingGradientBackground.tsx) for visual consistency,
// but tuned much CALMER: reduced opacity so it reads as a subtle, chill dark
// wash for a first impression — not a working-screen backdrop. Static (no
// motion). Scoped to the landing page; the shared components are untouched.
//
// The wash extends past the hero and is masked to FADE OUT toward the bottom,
// so it dissolves into the sections below instead of ending on a hard clip
// line. Full through the hero, tapers across "How it works", fully gone before
// "Features".
// ============================================================================
export function LandingGradientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[150svh] overflow-hidden"
      style={{
        // Fade the whole layer (and its blurred child) out toward the bottom.
        // Opaque through ~89svh (past all the hero's visible color) so the hero
        // and How-it-works fade read the same as before, then instead of hitting
        // pure transparent it trails off through a very faint (~4%) residual so
        // the drop-off is gradual rather than ending on a crisp boundary.
        // -webkit- prefix for Safari / older Chromium.
        maskImage:
          "linear-gradient(to bottom, black 0%, black 59%, rgba(0,0,0,0.04) 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 59%, rgba(0,0,0,0.04) 90%, transparent 100%)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      <div
        // Pinned to the hero's viewport scale (explicit height, NOT stretched to
        // the taller wrapper) so the blob positions/strength are unchanged from
        // before — the hero itself looks exactly the same. blur-[50px] keeps the
        // edges soft; opacity-45 keeps it a gentle wash over the dark base.
        className="absolute -top-24 -right-24 -left-24 opacity-45 blur-[50px]"
        style={{
          height: "calc(100svh + 12rem)",
          backgroundBlendMode: "screen",
          backgroundImage: [
            "radial-gradient(at 22% 22%, #1a52ac 0%, transparent 60%)",
            "radial-gradient(at 72% 30%, #ff6843 0%, transparent 60%)",
            "radial-gradient(at 48% 74%, #0718b1 0%, transparent 60%)",
          ].join(", "),
        }}
      />
    </div>
  );
}

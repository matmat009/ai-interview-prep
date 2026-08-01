// ============================================================================
// "Spectral Gradient (Darks)"
// ----------------------------------------------------------------------------
// Landing-only ambient background. Reuses the app's three brand hex colors
// (see components/layout/GradientBackground.tsx and
// features/onboarding/OnboardingGradientBackground.tsx) for visual consistency,
// but tuned much CALMER: reduced opacity so it reads as a subtle, chill dark
// wash for a first impression — not a working-screen backdrop. Static (no
// motion). Scoped to the landing page; the shared components are untouched.
// ============================================================================
export function LandingGradientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        // Oversized (-inset-24) + blur-[50px] so the blurred edges fall outside
        // the clip. opacity-45 keeps it a gentle ambient wash over the dark base.
        className="absolute -inset-24 opacity-45 blur-[50px]"
        style={{
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

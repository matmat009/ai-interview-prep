// Darker, gently animated variant of GradientBackground for the onboarding
// page. Same mesh-gradient approach and EXACT same color values as
// components/layout/GradientBackground.tsx — only dialed darker (color-layer
// opacity 0.80 -> 0.65, ~19% subdued) and given a slow position drift. The
// shared component is left untouched for the rest of the app.
export function OnboardingGradientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:rounded-xl"
    >
      <style>{`
        @keyframes onboarding-gradient-drift {
          0%   { background-position: 0% 0%; }
          50%  { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        .onboarding-gradient-anim {
          animation: onboarding-gradient-drift 28s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .onboarding-gradient-anim { animation: none; }
        }
      `}</style>
      <div
        className="onboarding-gradient-anim absolute -inset-24 opacity-[0.65] blur-[50px]"
        style={{
          backgroundBlendMode: "screen",
          backgroundRepeat: "no-repeat",
          // Oversized so the position drift never reveals a transparent edge.
          backgroundSize: "160% 160%",
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

// ============================================================================
// "Spectral Gradient (Darks)" — CLOSING counterpart
// ----------------------------------------------------------------------------
// The bottom-of-page companion to LandingGradientBackground.tsx. Same three
// brand hex colors and the same technique, but it lives behind the closing
// footer and FADES IN FROM BELOW (transparent at its top) so it never bleeds
// upward into FAQ. Meant to sit INSIDE a `relative` closing section, filling it
// (inset-0). Subtler than the hero's full-strength wash — closer to how the
// hero reads at its faded tail. Static; the shared app gradients are untouched.
// ============================================================================
export function LandingGradientBackgroundBottom() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        // Fade in from the bottom: opaque near the footer's base, transparent by
        // its top, so there's no hard top edge and no bleed above the footer.
        maskImage:
          "linear-gradient(to top, black 0%, black 45%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to top, black 0%, black 45%, transparent 100%)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      <div
        // Subtler than the hero (opacity-30 vs 45); same colors/technique.
        className="absolute -inset-24 opacity-30 blur-[50px]"
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

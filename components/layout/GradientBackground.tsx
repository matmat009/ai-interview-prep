// Vivid, glowing mesh-gradient light source for the (app) shell content area.
// Dark-theme only. Rendered as an absolutely-positioned layer inside the
// SidebarInset, behind the page content (see app/(app)/layout.tsx). Decorative.
//
// A single element stacks three radial-gradient layers (vivid blue upper-left,
// vivid purple upper-right, vivid magenta lower-center) blended with `screen` so
// they lighten into one another on the dark background. Each color stays near
// full brightness at its center and fades to transparent by ~60% radius, so the
// dark background shows through only at the far edges/corners. A light blur keeps
// the transitions soft. The inner layer is oversized (`-inset-24`) so its blurred
// edges fall outside the clip, avoiding a fade seam.
export function GradientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:rounded-xl"
    >
      <div
        className="absolute -inset-24 opacity-80 blur-[50px]"
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

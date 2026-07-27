import Image from "next/image";

import { cn } from "@/lib/utils";

// App logo mark, rendered from the raster in /public via next/image.
// object-contain preserves the (non-square) logo's aspect ratio inside the size
// box. Works in both server and client components.
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark-256.png"
      alt="PrepPilot logo"
      width={20}
      height={20}
      className={cn("size-5 object-contain", className)}
    />
  );
}

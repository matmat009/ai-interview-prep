"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Password field with an in-field show/hide toggle. Owns its own visibility
// state, so each instance (e.g. password vs confirm password) toggles
// independently. Accepts all the same props as <Input> except `type`, which it
// controls itself.
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        // Reserve room on the right so the value never runs under the toggle.
        className={cn("pr-9", className)}
      />
      <button
        type="button"
        // Kept out of the tab sequence so keyboard users tab field-to-field
        // without an extra stop; still pointer-clickable and announced to
        // screen readers via the aria-label.
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-white/40 outline-none transition-colors hover:text-white/70"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

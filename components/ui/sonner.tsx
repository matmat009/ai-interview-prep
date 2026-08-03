"use client"

import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon, Trash2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        // Success = emerald check, so success toasts read clearly distinct from
        // the destructive (red) one.
        success: (
          <CircleCheckIcon className="size-4 text-emerald-400" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Crisp 1px border + tight dark shadow (no colored glow); our type.
          toast:
            "cn-toast rounded-xl border-border shadow-lg shadow-black/25",
          title: "text-sm font-medium",
          description: "text-[13px] text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

// --- App toast helpers ------------------------------------------------------
// Two visual variants only: success (emerald check) and a destructive-action
// confirmation (red trash). Kept minimal and consistent with our dark theme.

export function toastSuccess(title: string, description?: string) {
  toast.success(title, { description })
}

// For a successful DESTRUCTIVE action (e.g. deletion) — not an error. Reads red
// so it's visually distinct from the success toasts.
export function toastDestructive(title: string, description?: string) {
  toast(title, {
    description,
    icon: <Trash2Icon className="size-4 text-red-400" />,
  })
}

export { Toaster }

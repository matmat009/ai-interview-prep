"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"
import { Loader2Icon, LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function NavUser() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!active || !user) return
      const fullName = (
        user.user_metadata?.full_name as string | undefined
      )?.trim()
      // Fallback to the email prefix for accounts created before full_name.
      const prefix = user.email?.split("@")[0] ?? "Account"
      setName(fullName || prefix)
      setEmail(user.email ?? "")
    })()
    return () => {
      active = false
    }
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut() // clears the session cookie
    // Middleware now sees no session; refresh drops cached authed server state.
    router.replace("/login")
    router.refresh()
  }

  return (
    <SidebarMenu>
      {/* Profile block — display only (no dropdown). */}
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          render={<div />}
          className="cursor-default rounded-lg border border-white/10 bg-white/5 hover:bg-white/5 hover:text-sidebar-foreground"
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {initialsFrom(name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{name || "…"}</span>
            <span className="truncate text-xs text-muted-foreground">
              {email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Standalone logout — always visible, not hidden in a menu. mt-2 sets it
          clearly apart from the profile block above. */}
      <SidebarMenuItem className="mt-2">
        <SidebarMenuButton
          onClick={handleLogout}
          disabled={loggingOut}
          tooltip="Log out"
          className="rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
        >
          {loggingOut ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <LogOutIcon />
          )}
          <span>{loggingOut ? "Logging out…" : "Log out"}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

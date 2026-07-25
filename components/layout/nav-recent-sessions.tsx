"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  fetchSessions,
  toDisplaySession,
  type Session,
} from "@/features/history/sessions"

const MAX_RECENT = 4

function relativeTime(iso: string): string {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (secs < 60) return "Just now"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function NavRecentSessions() {
  const pathname = usePathname()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  // Load this user's most recent sessions from the same data layer History uses.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const rows = await fetchSessions(supabase, user.id) // ordered created_at desc
        if (!active) return
        setSessions(rows.slice(0, MAX_RECENT).map(toDisplaySession))
      } catch {
        // Leave the list empty on error — this is a secondary widget.
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    // Text-heavy list makes no sense as icons — hide the whole section when the
    // sidebar collapses to the icon rail.
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Sessions</SidebarGroupLabel>
      <SidebarGroupContent>
        {loading ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            No sessions yet.
          </p>
        ) : (
          <SidebarMenu>
            {sessions.map((session) => {
              const href = `/history/${session.id}`
              const isActive = pathname === href
              return (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    isActive={isActive}
                    // Purple accent only when this session is the active route;
                    // hover keeps the default muted sidebar treatment.
                    className={
                      isActive
                        ? "h-auto flex-col items-start gap-0.5 py-2 data-active:bg-primary/10 data-active:text-primary hover:bg-primary/15 hover:text-primary"
                        : "h-auto flex-col items-start gap-0.5 py-2"
                    }
                    render={<Link href={href} />}
                  >
                    <span className="w-full truncate text-sm">
                      {session.role} · {session.focus}
                    </span>
                    <span className="w-full truncate text-xs text-muted-foreground">
                      {relativeTime(session.date)}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

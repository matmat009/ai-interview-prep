"use client"

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

// Dummy recent sessions with fake UUIDs (crypto.randomUUID shape, matching the
// real session routes). Replaced with real history once persistence is wired.
const RECENT_SESSIONS = [
  {
    id: "a1b2c3d4-0001-4a1b-8c2d-111111111111",
    focus: "Frontend Engineer · System Design",
    time: "2h ago",
  },
  {
    id: "a1b2c3d4-0002-4a1b-8c2d-222222222222",
    focus: "Backend Engineer · Behavioral",
    time: "Yesterday",
  },
  {
    id: "a1b2c3d4-0003-4a1b-8c2d-333333333333",
    focus: "Product Manager · Case Study",
    time: "3 days ago",
  },
  {
    id: "a1b2c3d4-0004-4a1b-8c2d-444444444444",
    focus: "Data Scientist · Technical",
    time: "Last week",
  },
]

export function NavRecentSessions() {
  const pathname = usePathname()

  return (
    // Text-heavy list makes no sense as icons — hide the whole section when the
    // sidebar collapses to the icon rail.
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Sessions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {RECENT_SESSIONS.map((session) => {
            const href = `/interview/${session.id}`
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
                    {session.focus}
                  </span>
                  <span className="w-full truncate text-xs text-muted-foreground">
                    {session.time}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

"use client"

import * as React from "react"

import Link from "next/link"

import { LogoMark } from "@/components/brand/logo-mark"
import { NavMain } from "@/components/layout/nav-main"
import { NavRecentSessions } from "@/components/layout/nav-recent-sessions"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ListIcon,
  LibraryIcon,
  Settings2Icon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Interview",
      url: "/interview",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "History",
      url: "/history",
      icon: <ListIcon />,
    },
    {
      title: "Question Bank",
      url: "/question-bank",
      icon: <LibraryIcon />,
    },
    {
      title: "Interview Profile",
      url: "/settings",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/interview" />}
            >
              <LogoMark className="size-5" />
              <span className="text-base font-semibold">PrepPilot</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavRecentSessions />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import * as React from "react"

import Link from "next/link"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { ThemeToggle } from "@/components/theme-toggle"
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
  SparklesIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Maya Chen",
    email: "maya@preppilot.app",
    avatar: "/avatars/maya.jpg",
  },
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
      title: "Settings",
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
              render={<Link href="/" />}
            >
              <SparklesIcon className="size-5!" />
              <span className="text-base font-semibold">PrepPilot</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:justify-center">
            <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              Theme
            </span>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

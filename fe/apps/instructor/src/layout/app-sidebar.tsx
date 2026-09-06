import * as React from "react"
import { navigation } from "@/config/navigation"

import { NavMain } from "@/components/sidebar/nav-main.tsx"
import { NavSecondary } from "@/components/sidebar/nav-secondary.tsx"
import { NavUser } from "@/components/sidebar/nav-user.tsx"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@fe/components/ui/sidebar.tsx"
import { GraduationCap } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! my-1 h-12 hover:bg-sidebar-accent"
              render={<a href="/" />}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold leading-none text-foreground">EduPro</span>
                <span className="text-[11px] font-medium text-muted-foreground leading-none mt-1">Cổng giảng viên</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navigation.main}></NavMain>
        <NavSecondary groups={navigation.secondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

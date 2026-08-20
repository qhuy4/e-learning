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
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user=
        {
            name: "Users",
            email: "Users",
            avatar: "/users",
        }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >

              <span className="text-base font-semibold">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navigation.main}></NavMain>
        <NavSecondary groups={navigation.secondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

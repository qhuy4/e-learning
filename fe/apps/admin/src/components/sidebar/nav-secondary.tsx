"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@fe/components/ui/sidebar.tsx"
import type {NavItem} from "@/shared/types/navigation.ts";
import { NavLink } from "react-router";

export function NavSecondary({
  groups,
  ...props
}: {
  groups: NavItem[],
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {groups.map((item) => {
            const Icon = item.icon
            return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} render={<NavLink to={item.url} />}>
                    {Icon && <Icon />}
                    <span className="text-sm font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@fe/components/ui/sidebar.tsx"
import type { NavItem } from "@/shared/types/navigation.ts"
import { NavLink } from "react-router"

export function NavSecondary({
  items,
  ...props
}: {
  items?: NavItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  if (!items || !Array.isArray(items)) return null;

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <div className="pl-2">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} render={<NavLink to={item.url} />} className="font-light">
                    {Icon && <Icon />}
                    <span className="text-sm font-light">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </div>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

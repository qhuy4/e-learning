"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@fe/components/ui/sidebar.tsx"
import type { NavGroup } from "@/shared/types/navigation.ts"
import { NavLink } from "react-router"

export function NavSecondary({
  groups,
  ...props
}: {
  groups?: NavGroup[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  if (!groups || !Array.isArray(groups)) return null;

  return (
    <>
      {groups.map((group, idx) => {
        const items = group.items || [];
        return (
          <SidebarGroup key={group.label || idx} {...props}>
            {group.label && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
            )}
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
        );
      })}
    </>
  )
}

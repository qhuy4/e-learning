import {Button} from "@fe/components/ui/button.tsx"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@fe/components/ui/sidebar.tsx"
import {CirclePlusIcon,MailIcon} from "lucide-react"
import type {NavGroup} from "@/shared/types/navigation.ts";
import { NavLink } from "react-router";

import { useLocation } from "react-router";

export function NavMain({ groups }: {
    groups: NavGroup[],
}) {
    const location = useLocation();
    
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {groups.map((group) => (
                        <div key={group.label ?? "default"}>
                            {group.label && (
                                <div className="px-2 py-2 text-sm font-semibold text-foreground/80">
                                    {group.label}
                                </div>
                            )}

                            {group.items.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.url;

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={isActive}
                                            render={<NavLink to={item.url} />}
                                            className={isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                                        >
                                            {Icon && <Icon className={isActive ? "text-emerald-600 dark:text-emerald-400" : ""} />}
                                            <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </div>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

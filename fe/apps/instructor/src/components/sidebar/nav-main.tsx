import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@fe/components/ui/sidebar.tsx"
import type {NavGroup} from "@/shared/types/navigation.ts";
import { NavLink, useLocation } from "react-router";

export function NavMain({ groups }: {
    groups: NavGroup[],
}) {
    const location = useLocation();

    const isActive = (url: string) => {
        if (url === "/") return location.pathname === "/";
        return location.pathname === url || location.pathname.startsWith(url + "/");
    };

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
                                const active = isActive(item.url);

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={active}
                                            render={<NavLink to={item.url} />}
                                            className={active ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                                        >
                                            {Icon && <Icon className={active ? "text-emerald-600 dark:text-emerald-400" : ""} />}
                                            <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>{item.title}</span>
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

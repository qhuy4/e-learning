import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@fe/components/ui/sidebar.tsx"
import type {NavGroup} from "@/shared/types/navigation.ts";
import {NavLink, useLocation} from "react-router";

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
                                <div className="px-2 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {group.label}
                                </div>
                            )}

                            <div className="pl-2">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const isActive = location.pathname === item.url;

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                isActive={isActive}
                                                render={<NavLink to={item.url} />}
                                                className={`font-light ${isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}`}
                                            >
                                                {Icon && <Icon className={isActive ? "text-emerald-600 dark:text-emerald-400" : ""} />}
                                                <span className={`text-sm ${isActive ? "font-normal" : "font-light"}`}>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

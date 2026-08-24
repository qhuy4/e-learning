import {
    LayoutDashboard,
    Users,
    Settings, ChartBar,
} from "lucide-react"
import type { NavGroup,NavItem } from "@/shared/types/navigation"
type Navigation = {
    main: NavGroup[]
    secondary: NavItem[]
}
export const navigation : Navigation = {
    main: [
        {
            label: "Overview",
            items: [
                {
                    title: "Dashboard",
                    url: "/",
                    icon: LayoutDashboard,
                },
                {
                    title: "Analytics",
                    url: "/analytics",
                    icon: ChartBar,
                },
            ],
        },
        {
            label: "Management",
            items: [
                {
                    title: "Users",
                    url: "/users",
                    icon: Users,
                },
            ],
        },

    ],

    secondary: [
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
    ],
}
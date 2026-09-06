import {
    LayoutDashboard,
    BookOpen,
    Users,
    DollarSign,
    UserCircle,
    Settings,
    LogOut,
} from "lucide-react"
import type { NavGroup, NavItem } from "@/shared/types/navigation"

type Navigation = {
    main: NavGroup[]
    secondary: NavItem[]
}

export const navigation: Navigation = {
    main: [
        {
            label: "Tổng quan",
            items: [
                {
                    title: "Dashboard",
                    url: "/",
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            label: "Quản lý",
            items: [
                {
                    title: "Khóa học",
                    url: "/courses",
                    icon: BookOpen,
                },
                {
                    title: "Học viên",
                    url: "/students",
                    icon: Users,
                },
                {
                    title: "Doanh thu",
                    url: "/revenue",
                    icon: DollarSign,
                },
            ],
        },
    ],
    secondary: [
        {
            title: "Hồ sơ",
            url: "/profile",
            icon: UserCircle,
        },
        {
            title: "Cài đặt",
            url: "/settings",
            icon: Settings,
        },
        {
            title: "Đăng xuất",
            url: "/logout",
            icon: LogOut,
        },
    ],
}

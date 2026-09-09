import {
    LayoutDashboard,
    Users,
    Settings, ChartBar, GraduationCap, UserRound,
    LogOut,
    BookOpen,
    DollarSign,
    Star
} from "lucide-react"
import type { NavGroup,NavItem } from "@/shared/types/navigation"
type Navigation = {
    main: NavGroup[]
    secondary: NavItem[]
}
export const navigation: Navigation = {
    main: [
        {
            label: "Quản lý chung",
            items: [
                {
                    title: "Tổng quan",
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
                {
                    title: "Instructors",
                    url: "/instructors",
                    icon: GraduationCap,
                },
                {
                    title: "Students",
                    url: "/students",
                    icon: UserRound,
                },
            ],
        },
        {
            label: "Học tập",
            items: [
                {
                    title: "Khóa học của tôi",
                    url: "/courses",
                    icon: BookOpen,
                },
                {
                    title: "Đánh giá",
                    url: "/reviews",
                    icon: Star,
                },
            ],
        },
        {
            label: "Tài chính",
            items: [
                {
                    title: "Doanh thu",
                    url: "/earnings",
                    icon: DollarSign,
                },
            ],
        },
    ],

    secondary: [
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
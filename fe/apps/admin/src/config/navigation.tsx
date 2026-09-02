import {
    LayoutDashboard,
    Users,
    Settings, 
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
                    title: "Học viên",
                    url: "/students",
                    icon: Users,
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
                {
                    title: "Duyệt Giảng Viên (eKYC)",
                    url: "/instructors/approvals",
                    icon: Users,
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
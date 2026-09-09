import {
    LayoutDashboard,
    Users,
    Settings,
    ChartBar,
    GraduationCap,
    BookOpen,
    DollarSign,
    Star,
    LogOut,
    UserCheck,
    Shield,
    ShoppingCart,
    ClipboardList,
    Tag,
} from "lucide-react"
import type { NavGroup, NavItem } from "@/shared/types/navigation"

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
            label: "Quản lý",
            items: [
                {
                    title: "Users",
                    url: "/users",
                    icon: Users,
                },
                {
                    title: "Duyệt Giảng Viên (eKYC)",
                    url: "/instructors/approvals",
                    icon: UserCheck,
                },
            ],
        },
        {
            label: "Học tập",
            items: [
                {
                    title: "Khóa học",
                    url: "/courses",
                    icon: BookOpen,
                },
                {
                    title: "Học viên",
                    url: "/students",
                    icon: GraduationCap,
                },
                {
                    title: "Giảng viên",
                    url: "/instructors",
                    icon: Users,
                },
                {
                    title: "Đánh giá",
                    url: "/reviews",
                    icon: Star,
                },
                {
                    title: "Ghi danh",
                    url: "/enrollments",
                    icon: ClipboardList,
                },
            ],
        },
        {
            label: "Tài chính",
            items: [
                {
                    title: "Đơn hàng",
                    url: "/orders",
                    icon: ShoppingCart,
                },
                {
                    title: "Mã giảm giá",
                    url: "/coupons",
                    icon: Tag,
                },
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
            title: "Hệ thống",
            items: [
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
        },
    ],
}

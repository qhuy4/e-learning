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
    UserRound,
    ShoppingCart,
    ClipboardList,
    Tag,
    FolderTree,
    MessageCircle,
    Flag,
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
                    title: "Giảng viên",
                    url: "/instructors",
                    icon: GraduationCap,
                },
                {
                    title: "Duyệt Giảng Viên (eKYC)",
                    url: "/instructors/approvals",
                    icon: UserCheck,
                },
                {
                    title: "Học viên",
                    url: "/students",
                    icon: UserRound,
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
                    title: "Danh mục",
                    url: "/categories",
                    icon: FolderTree,
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
                {
                    title: "Hỏi đáp",
                    url: "/questions",
                    icon: MessageCircle,
                },
                {
                    title: "Báo cáo",
                    url: "/review-reports",
                    icon: Flag,
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

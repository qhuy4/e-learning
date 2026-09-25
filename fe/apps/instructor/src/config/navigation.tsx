import {
    LayoutDashboard,
    BookOpen,
    Users,
    DollarSign,
    CreditCard,
    Clock,
    Award,
    GraduationCap,
    UserCircle,
    LogOut,
    Trophy,
    MessageCircleQuestion,
    CalendarClock,
    CalendarDays,
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
                    title: "Lịch tuần",
                    url: "/schedule",
                    icon: CalendarDays,
                },
                {
                    title: "Đặt lịch",
                    url: "/bookings",
                    icon: CalendarClock,
                },
                {
                    title: "Doanh thu",
                    url: "/revenue",
                    icon: DollarSign,
                },
                {
                    title: "Thanh toán",
                    url: "/payments",
                    icon: CreditCard,
                },
                {
                    title: "Lịch giảng dạy",
                    url: "/availability",
                    icon: Clock,
                },
                {
                    title: "Chứng chỉ",
                    url: "/certificates",
                    icon: Award,
                },
                {
                    title: "Thành tựu",
                    url: "/achievements",
                    icon: Trophy,
                },
                {
                    title: "Câu hỏi",
                    url: "/qa",
                    icon: MessageCircleQuestion,
                },
                {
                    title: "Đăng ký giáo viên",
                    url: "/teacher/register",
                    icon: GraduationCap,
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
            title: "Đăng xuất",
            url: "/logout",
            icon: LogOut,
        },
    ],
}

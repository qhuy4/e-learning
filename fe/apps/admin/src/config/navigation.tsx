import {
    Bell,
    BookOpen,
    Calendar,
    ClipboardCheck,
    ClipboardList,
    CreditCard,
    Crown,
    DollarSign,
    FileCheck,
    FileText,
    Flag,
    FolderTree,
    GraduationCap,
    HandCoins,
    Heart,
    LayoutDashboard,
    LayoutList,
    LogOut,
    MessageCircle,
    Settings,
    ShoppingCart,
    Star,
    Tag,
    Trophy,
    UserCheck,
    UserRound,
    Users,
} from "lucide-react"
import type {NavGroup, NavItem} from "@/shared/types/navigation"

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
                    title: "Duyệt Giảng Viên",
                    url: "/instructors/applications",
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
            label: "Đề thi",
            items: [
                {
                    title: "Đề thi",
                    url: "/exams",
                    icon: ClipboardCheck,
                },
                {
                    title: "Loại đề thi",
                    url: "/exam-types",
                    icon: FileText,
                },
                {
                    title: "Định dạng đề thi",
                    url: "/exam-formats",
                    icon: LayoutList,
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
                {
                    title: "Thành tựu",
                    url: "/achievements",
                    icon: Trophy,
                },
                {
                    title: "Đặt lịch",
                    url: "/bookings",
                    icon: Calendar,
                },
                {
                    title: "Chứng chỉ giảng viên",
                    url: "/instructor-certificates",
                    icon: FileCheck,
                },
                {
                    title: "Thông báo",
                    url: "/notifications",
                    icon: Bell,
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
                {
                    title: "Thanh toán",
                    url: "/payments",
                    icon: CreditCard,
                },
                {
                    title: "Yêu cầu rút tiền",
                    url: "/payout-requests",
                    icon: HandCoins,
                },
            ],
        },
        {
            label: "Khác",
            items: [
                {
                    title: "Gói Premium",
                    url: "/premium-subscriptions",
                    icon: Crown,
                },
                {
                    title: "Danh sách yêu thích",
                    url: "/wishlists",
                    icon: Heart,
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

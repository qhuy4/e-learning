import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  CreditCard,
  Clock,
  Award,
  UserCircle,
  LogOut,
  Trophy,
  MessageCircleQuestion,
  MessagesSquare,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Sparkles,
  Banknote,
} from "lucide-react";
import type { NavGroup, NavItem } from "@/shared/types/navigation";

type Navigation = {
  main: NavGroup[];
  secondary: NavItem[];
};

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
      label: "Hồ sơ & AI",
      items: [
        {
          title: "Hồ sơ giảng dạy",
          url: "/teaching-profile",
          icon: ClipboardList,
        },
        {
          title: "Hồ sơ kỹ năng AI",
          url: "/skill-profile",
          icon: Sparkles,
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
          title: "Học phí 1:1",
          url: "/session-pricing",
          icon: Banknote,
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
          title: "Bình luận bài học",
          url: "/lesson-comments",
          icon: MessagesSquare,
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
};

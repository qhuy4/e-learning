import { Separator } from "@fe/components/ui/separator";
import { SidebarTrigger } from "@fe/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider.tsx";
import { Button } from "@fe/components/ui/button.tsx";
import { Moon, Sun, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useUnreadCount } from "@/features/notifications/hooks/use-notifications";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/courses": "Khóa học",
  "/courses/create": "Tạo khóa học",
  "/students": "Học viên",
  "/students/create": "Tạo học viên",
  "/instructors": "Giảng viên",
  "/instructors/approvals": "Duyệt Giảng Viên",
  "/earnings": "Doanh thu",
  "/payments": "Thanh toán",
  "/payout-requests": "Yêu cầu rút tiền",
  "/questions": "Hỏi đáp",
  "/reviews": "Đánh giá",
  "/review-reports": "Báo cáo đánh giá",
  "/orders": "Đơn hàng",
  "/coupons": "Mã giảm giá",
  "/coupons/create": "Tạo mã giảm giá",
  "/categories": "Danh mục",
  "/categories/create": "Tạo danh mục",
  "/enrollments": "Ghi danh",
  "/users": "Users",
  "/settings": "Cài đặt",
  "/achievements": "Thành tựu",
  "/instructor-certificates": "Chứng chỉ giảng viên",
  "/notifications": "Thông báo",
  "/premium-subscriptions": "Gói Premium",
  "/wishlists": "Danh sách yêu thích",
};

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const getPageTitle = () => {
    // Check exact match first
    if (PAGE_TITLES[location.pathname]) return PAGE_TITLES[location.pathname];
    // Check dynamic routes
    if (location.pathname.startsWith("/courses/") && location.pathname.includes("/lessons/"))
      return "Bài học";
    if (location.pathname.startsWith("/courses/")) return "Chỉnh sửa khóa học";
    if (location.pathname.startsWith("/lessons/")) return "Chỉnh sửa bài học";
    if (location.pathname.startsWith("/students/")) {
      if (location.pathname.endsWith("/edit")) return "Chỉnh sửa học viên";
      return "Chi tiết học viên";
    }
    if (location.pathname.startsWith("/instructors/")) {
      if (location.pathname.endsWith("/edit")) return "Chỉnh sửa giảng viên";
      return "Chi tiết giảng viên";
    }
    if (location.pathname.startsWith("/orders/")) return "Chi tiết đơn hàng";
    if (location.pathname.startsWith("/coupons/") && location.pathname.endsWith("/edit")) return "Chỉnh sửa mã giảm giá";
    if (location.pathname.startsWith("/categories/") && location.pathname.endsWith("/edit")) return "Chỉnh sửa danh mục";
    if (location.pathname.startsWith("/review-reports/")) return "Chi tiết báo cáo";
    if (location.pathname.startsWith("/questions/")) return "Chi tiết câu hỏi";
    if (location.pathname.startsWith("/achievements/")) return "Chi tiết thành tựu";
    if (location.pathname.startsWith("/instructor-certificates/")) return "Chi tiết chứng chỉ giảng viên";
    if (location.pathname.startsWith("/notifications/")) return "Chi tiết thông báo";
    if (location.pathname.startsWith("/premium-subscriptions/")) return "Chi tiết gói Premium";
    if (location.pathname.startsWith("/wishlists/")) return "Chi tiết danh sách yêu thích";
    if (location.pathname.startsWith("/earnings/payouts/")) return "Chi tiết thanh toán";
    if (location.pathname.startsWith("/payout-requests/")) return "Chi tiết yêu cầu rút tiền";
    if (location.pathname.startsWith("/earnings/")) return "Doanh thu";
    if (location.pathname.startsWith("/payments/")) return "Chi tiết giao dịch";
    if (location.pathname.startsWith("/users/")) {
      if (location.pathname.endsWith("/edit")) return "Chỉnh sửa người dùng";
      return "Chi tiết người dùng";
    }
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 flex h-[--header-height] shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        {/* Left: trigger + page title */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5 data-vertical:self-auto" />
          <h1 className="text-base font-semibold text-foreground">{getPageTitle()}</h1>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Đổi giao diện"
          >
            <Sun className="h-4.5 w-4.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4.5 w-4.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

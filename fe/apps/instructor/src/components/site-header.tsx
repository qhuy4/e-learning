import { Separator } from "@fe/components/ui/separator";
import { SidebarTrigger } from "@fe/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider.tsx";
import { Button } from "@fe/components/ui/button.tsx";
import { Moon, Sun, Bell } from "lucide-react";
import { useLocation } from "react-router";

const PAGE_TITLES: Record<string, string> = {
  "/": "Tổng quan",
  "/courses": "Khóa học",
  "/students": "Học viên",
  "/revenue": "Doanh thu",
  "/availability": "Lịch giảng dạy",
  "/certificates": "Chứng chỉ",
  "/achievements": "Thành tựu",
  "/qa": "Câu hỏi & Thảo luận",
  "/profile": "Hồ sơ",
};

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    if (PAGE_TITLES[location.pathname]) return PAGE_TITLES[location.pathname];
    if (location.pathname.startsWith("/courses/create")) return "Tạo khóa học";
    if (location.pathname.startsWith("/courses/")) return "Chỉnh sửa khóa học";
    if (location.pathname.startsWith("/students/")) return "Chi tiết học viên";
    if (location.pathname.startsWith("/certificates/create")) return "Tạo chứng chỉ";
    if (location.pathname.startsWith("/certificates/")) return "Chi tiết chứng chỉ";
    if (location.pathname.startsWith("/lessons/")) return "Chỉnh sửa bài học";
    if (location.pathname.startsWith("/qa/")) return "Chi tiết câu hỏi";
    return "Tổng quan";
  };

  return (
    <header className="sticky top-0 z-40 flex h-[--header-height] shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5 data-vertical:self-auto" />
          <h1 className="text-base font-semibold text-foreground">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
          </Button>

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

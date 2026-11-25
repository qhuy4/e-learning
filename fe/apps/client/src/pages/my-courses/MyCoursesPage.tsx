import { useState } from "react";
import {
  Loader2,
  BookOpen,
  Compass,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { useMyEnrollments } from "@/features/enrollment/hooks/use-enrollment";
import { CourseCardEnrolled } from "@/features/enrollment/components/CourseCardEnrolled";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Link } from "react-router";
import { Button } from "@fe/components/ui/button";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "in-progress", label: "Đang học" },
  { id: "completed", label: "Hoàn thành" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export const MyCoursesPage = () => {
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"enrolledAt" | "progress" | "title">("enrolledAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data, isLoading } = useMyEnrollments(
    {
      page,
      limit,
      keyword: searchKeyword || undefined,
      sortBy,
      sortOrder,
    },
    { enabled: isAuthenticated },
  );

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Bạn chưa đăng nhập</h2>
        <p className="max-w-sm text-muted-foreground">
          Vui lòng đăng nhập tài khoản để xem toàn bộ danh sách khóa học của bạn.
        </p>
        <Link to="/login?redirect=/my-courses" className="pt-2">
          <Button className="rounded-xl px-8 font-semibold">
            Đăng nhập ngay
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Đang tải khóa học của bạn...
        </p>
      </div>
    );
  }

  const enrollments = data?.data ?? [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalItems = data?.meta?.total ?? 0;

  // Filter enrollments based on active status tab
  const filteredEnrollments = enrollments.filter((e) => {
    if (activeTab === "in-progress") return (e.progress ?? 0) < 100;
    if (activeTab === "completed") return (e.progress ?? 0) >= 100;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pt-5 pb-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <div className="mb-5 flex flex-wrap items-center gap-3 lg:mb-6">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Khóa học của tôi
          </h1>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
            {totalItems} khóa học
          </span>
        </div>

        {/* Toolbar: tabs + tìm kiếm + sắp xếp */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Tabs */}
            <div className="inline-flex self-start rounded-xl bg-muted p-1 text-xs font-semibold">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`cursor-pointer rounded-lg px-4 py-2 transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search + sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-60 lg:w-72">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khóa học..."
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-9 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    aria-label="Xóa tìm kiếm"
                    onClick={() => {
                      setSearchKeyword("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-") as [
                      "enrolledAt" | "progress" | "title",
                      "asc" | "desc"
                    ];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                    setPage(1);
                  }}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-border bg-card py-2.5 pl-4 pr-9 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 sm:w-auto"
                >
                  <option value="enrolledAt-desc">Mới đăng ký nhất</option>
                  <option value="enrolledAt-asc">Cũ nhất</option>
                  <option value="progress-desc">Tiến độ cao nhất</option>
                  <option value="progress-asc">Tiến độ thấp nhất</option>
                  <option value="title-asc">Tên khóa học (A-Z)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Lưới khóa học / trạng thái rỗng */}
        {filteredEnrollments.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Không tìm thấy khóa học nào
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {searchKeyword
                ? `Không tìm thấy kết quả nào phù hợp với từ khóa "${searchKeyword}".`
                : activeTab === "all"
                ? "Bạn chưa đăng ký khóa học nào. Hãy khám phá kho khóa học đa dạng để bắt đầu học ngay!"
                : "Chưa có khóa học nào trong mục này."}
            </p>
            <Link to="/" className="mt-5 inline-block">
              <Button className="rounded-xl px-6 text-sm font-semibold">
                Khám phá khóa học ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredEnrollments.map((enrollment) => (
              <CourseCardEnrolled key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl text-xs font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              Trang trước
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 cursor-pointer rounded-xl text-xs font-bold transition-all ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl text-xs font-semibold disabled:opacity-40"
            >
              Trang sau
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

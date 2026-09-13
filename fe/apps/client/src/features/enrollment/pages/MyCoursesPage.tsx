import { useState } from "react";
import {
  Loader2,
  BookOpen,
  Compass,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
} from "lucide-react";
import { useMyEnrollments } from "../hooks/use-enrollment";
import { CourseCardEnrolled } from "../components/CourseCardEnrolled";
import { useAuth } from "../../auth/hooks/use-auth";
import { Link } from "react-router";
import { Button } from "@fe/components/ui/button";

export const MyCoursesPage = () => {
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all");
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Bạn chưa đăng nhập</h2>
        <p className="text-slate-500 max-w-sm">
          Vui lòng đăng nhập tài khoản để xem toàn bộ danh sách khóa học của bạn.
        </p>
        <Link to="/login?redirect=/my-courses">
          <Button className="bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full px-8 py-2.5">
            Đăng nhập ngay
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-slate-400 text-sm font-medium">Đang tải khóa học của bạn...</p>
      </div>
    );
  }

  const enrollments = data?.data ?? [];
  const totalPages = data?.meta?.totalPages || 1;

  // Filter enrollments based on active status tab
  const filteredEnrollments = enrollments.filter((e) => {
    if (activeTab === "in-progress") return (e.progress ?? 0) < 100;
    if (activeTab === "completed") return (e.progress ?? 0) >= 100;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6">
        {/* Header & Filter Control Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Khóa học của tôi
            </h1>

            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-full text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("in-progress");
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === "in-progress"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đang học
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("completed");
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === "completed"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hoàn thành
              </button>
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khóa học..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
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
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="enrolledAt-desc">Mới đăng ký nhất</option>
                <option value="enrolledAt-asc">Cũ nhất</option>
                <option value="progress-desc">Tiến độ cao nhất</option>
                <option value="progress-asc">Tiến độ thấp nhất</option>
                <option value="title-asc">Tên khóa học (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid / Empty State */}
        {filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy khóa học nào</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {searchKeyword
                ? `Không tìm thấy kết quả nào phù hợp với từ khóa "${searchKeyword}".`
                : activeTab === "all"
                ? "Bạn chưa đăng ký khóa học nào. Hãy khám phá kho khóa học đa dạng để bắt đầu học ngay!"
                : "Chưa có khóa học nào trong mục này."}
            </p>
            <Link to="/" className="inline-block pt-2">
              <Button className="bg-slate-900 hover:bg-emerald-600 text-white font-semibold rounded-full px-6 py-2.5 text-sm transition-colors">
                Khám phá khóa học ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <CourseCardEnrolled key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full text-xs font-semibold px-4 py-2 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Trang trước
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    p === page
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
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
              className="rounded-full text-xs font-semibold px-4 py-2 disabled:opacity-40 cursor-pointer"
            >
              Trang sau <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

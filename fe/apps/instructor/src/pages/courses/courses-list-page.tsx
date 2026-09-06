import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  useGetCourses,
  useDeleteCourse,
} from "@/features/courses/hook/use-courses";
import { CourseCard } from "@/features/courses/components/course-list/course-card";
import { CourseFilterBar } from "@/features/courses/components/course-list/course-filter-bar";
import { CourseListSkeleton } from "@/features/courses/components/course-list/course-skeleton";
import { CourseEmptyState } from "@/features/courses/components/course-list/course-empty-state";
import { CoursePagination } from "@/features/courses/components/course-list/course-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";

import { Button } from "@fe/components/ui/button";

const LIMIT = 9;

export default function CoursesListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const { data: coursesData, isLoading } = useGetCourses({
    page,
    limit: LIMIT,
    keyword: keyword || undefined,
    level: level || undefined,
    status: status || undefined,
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();

  const courses = coursesData?.data ?? [];
  const meta = coursesData?.meta;

  const handleFilterChange = () => setPage(1);

  const handleDeleteRequest = (id: string | number) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    const tid = toast.loading("Đang xóa khóa học...");
    deleteCourse(String(deletingId), {
      onSuccess: () => {
        toast.success("Đã xóa khóa học thành công!", { id: tid });
        if (courses.length === 1 && page > 1) setPage((p) => p - 1);
      },
      onError: () => toast.error("Có lỗi xảy ra khi xóa, vui lòng thử lại.", { id: tid }),
      onSettled: () => setDeletingId(null),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khóa học của tôi</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý và cập nhật các khóa học của bạn</p>
        </div>
        <Button
          onClick={() => navigate("/courses/create")}
          className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo khóa học mới
        </Button>
      </div>

      <CourseFilterBar
        keyword={keyword}
        level={level}
        status={status}
        onKeywordChange={(v) => { setKeyword(v); handleFilterChange(); }}
        onLevelChange={(v) => { setLevel(v); handleFilterChange(); }}
        onStatusChange={(v) => { setStatus(v); handleFilterChange(); }}
      />

      {isLoading ? (
        <CourseListSkeleton />
      ) : courses.length === 0 ? (
        <CourseEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={(id) => navigate(`/courses/${id}`)}
              onDelete={handleDeleteRequest}
              isDeleting={isDeleting && deletingId === course.id}
            />
          ))}
        </div>
      )}

      {!isLoading && meta && meta.totalPages > 1 && (
        <CoursePagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deletingId !== null}
        title="Xóa khóa học"
        description="Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa khóa học"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

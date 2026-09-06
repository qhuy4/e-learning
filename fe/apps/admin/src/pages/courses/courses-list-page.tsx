import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  useGetCourses,
  useUpdateCourse,
} from "@/features/courses/hook/use-courses";
import { CourseCard } from "@/features/courses/components/course-list/course-card";
import { CourseFilterBar } from "@/features/courses/components/course-list/course-filter-bar";
import { CourseListSkeleton } from "@/features/courses/components/course-list/course-skeleton";
import { CourseEmptyState } from "@/features/courses/components/course-list/course-empty-state";
import { CoursePagination } from "@/features/courses/components/course-list/course-pagination";

const LIMIT = 9;

export function CoursesListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: coursesData, isLoading } = useGetCourses({
    page,
    limit: LIMIT,
    keyword: keyword || undefined,
    level: level || undefined,
    status: status || undefined,
  });

  const { mutate: updateCourse } = useUpdateCourse();

  const courses = coursesData?.data ?? [];
  const meta = coursesData?.meta;

  const handleFilterChange = () => setPage(1);

  const handleApprove = (id: string) => {
    const tid = toast.loading("Đang duyệt khóa học...");
    const formData = new FormData();
    formData.append("status", "3");
    updateCourse({ id, data: formData }, {
      onSuccess: () => {
        toast.success("Đã duyệt khóa học thành công!", { id: tid });
      },
      onError: () => toast.error("Có lỗi xảy ra khi duyệt, vui lòng thử lại.", { id: tid }),
    });
  };

  const handleReject = (id: string) => {
    const tid = toast.loading("Đang từ chối khóa học...");
    const formData = new FormData();
    formData.append("status", "4");
    updateCourse({ id, data: formData }, {
      onSuccess: () => {
        toast.success("Đã từ chối khóa học!", { id: tid });
      },
      onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại.", { id: tid }),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý khóa học</h1>
          <p className="text-sm text-muted-foreground mt-1">Xem và duyệt các khóa học</p>
        </div>
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
              onView={(id) => navigate(`/courses/${id}`)}
              onApprove={handleApprove}
              onReject={handleReject}
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
    </div>
  );
}

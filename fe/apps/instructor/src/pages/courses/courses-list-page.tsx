import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  useGetCourses,
  useCloneCourse,
} from "@/features/courses/hook/use-courses";
import { CourseCard } from "@/features/courses/components/course-list/course-card";
import { CourseFilterBar } from "@/features/courses/components/course-list/course-filter-bar";
import { CourseListSkeleton } from "@/features/courses/components/course-list/course-skeleton";
import { CourseEmptyState } from "@/features/courses/components/course-list/course-empty-state";
import { CoursePagination } from "@/features/courses/components/course-list/course-pagination";

import { Button } from "@fe/components/ui/button";

const LIMIT = 9;

export default function CoursesListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [cloningId, setCloningId] = useState<string | null>(null);

  const { data: coursesData, isLoading } = useGetCourses({
    page,
    limit: LIMIT,
    keyword: keyword || undefined,
    level: level ? Number(level) : undefined,
    status: status ? Number(status) : undefined,
  });

  const { mutate: cloneCourse, isPending: isCloning } = useCloneCourse();

  const courses = coursesData?.data ?? [];
  const meta = coursesData?.meta;

  const handleFilterChange = () => setPage(1);

  const handleClone = (id: string) => {
    setCloningId(id);
    const tid = toast.loading("Đang nhân bản khóa học...");
    cloneCourse(String(id), {
      onSuccess: (res) => {
        toast.success("Đã nhân bản khóa học!", { id: tid });
        navigate(`/courses/${res.data.id}`);
      },
      onError: () => toast.error("Có lỗi xảy ra khi nhân bản.", { id: tid }),
      onSettled: () => setCloningId(null),
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
              onClone={handleClone}
              isCloning={isCloning && cloningId === course.id}
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

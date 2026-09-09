import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  useGetMyCourses,
  useDeleteCourse,
  useCloneCourse,
  useCancelReviewCourse,
} from "@/features/courses/hook/use-courses";
import { CourseCard } from "@/features/courses/components/course-list/course-card";
import { CourseFilterBar } from "@/features/courses/components/course-list/course-filter-bar";
import { CourseListSkeleton } from "@/features/courses/components/course-list/course-skeleton";
import { CourseEmptyState } from "@/features/courses/components/course-list/course-empty-state";
import { CoursePagination } from "@/features/courses/components/course-list/course-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";

import { Button } from "@fe/components/ui/button";

const LIMIT = 9;

export function CoursesListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [cloningId, setCloningId] = useState<string | number | null>(null);
  const [cancelingCourse, setCancelingCourse] = useState<any | null>(null);

  // Dùng useGetMyCourses để chỉ lấy khóa học của instructor đang đăng nhập
  const { data: coursesData, isLoading } = useGetMyCourses({
    page,
    limit: LIMIT,
    keyword: keyword || undefined,
    level: (level && level !== "all") ? level : undefined,
    status: (status && status !== "all") ? status : undefined,
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { mutate: cloneCourse } = useCloneCourse();
  const { mutate: cancelReview, isPending: isCancelingReview } = useCancelReviewCourse();

  const courses = coursesData?.data ?? [];
  const meta = coursesData?.meta;

  const handleFilterChange = () => setPage(1);

  const handleDeleteRequest = (id: string | number) => {
    setDeletingId(id);
  };

  const handleEdit = (course: any) => {
    if (course.status === 2) {
      toast.warning("Khóa học đang chờ duyệt, không thể chỉnh sửa. Vui lòng hủy duyệt trước.");
      return;
    }
    if (course.status === 5) { // Published
      setCloningId(course.id);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  const handleCancelReviewRequest = (course: any) => {
    setCancelingCourse(course);
  };

  const handleCancelReviewConfirm = () => {
    if (!cancelingCourse) return;
    const tid = toast.loading("Đang hủy yêu cầu duyệt...");
    cancelReview(cancelingCourse.id, {
      onSuccess: () => {
        toast.success("Đã hủy yêu cầu duyệt. Khóa học đã chuyển về bản nháp!", { id: tid });
        setCancelingCourse(null);
      },
      onError: () => {
        toast.error("Có lỗi xảy ra khi hủy yêu cầu duyệt, vui lòng thử lại.", { id: tid });
        setCancelingCourse(null);
      },
    });
  };

  const handleCloneConfirm = () => {
    if (!cloningId) return;
    const tid = toast.loading("Đang tạo bản sao để chỉnh sửa...");
    cloneCourse(cloningId, {
      onSuccess: (res: any) => {
        toast.success("Tạo bản sao thành công!", { id: tid });
        const newId = res.data?.id || res.id || res;
        setCloningId(null);
        // Navigate sau khi refetch đã hoàn tất (refetch xảy ra trong onSuccess của hook)
        navigate(`/courses/${newId}`);
      },
      onError: (error: any) => {
        // Lấy message từ BE (ví dụ: 409 ConflictException)
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi tạo bản sao.";
        toast.error(message, { id: tid });
        setCloningId(null);
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    const tid = toast.loading("Đang xóa khóa học...");
    deleteCourse(deletingId, {
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
        <CourseEmptyState onCreateClick={() => navigate("/courses/create")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              isDeleting={isDeleting && deletingId === course.id}
              onCancelReview={handleCancelReviewRequest}
              isCancelingReview={isCancelingReview && cancelingCourse?.id === course.id}
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

      <ConfirmDialog
        open={cloningId !== null}
        title="Tạo bản sao khóa học"
        description="Khóa học này đã được xuất bản. Bạn có muốn tạo một bản sao để chỉnh sửa không? Phiên bản gốc sẽ không bị ảnh hưởng cho đến khi bản cập nhật được duyệt."
        confirmLabel="Tạo bản sao"
        onConfirm={handleCloneConfirm}
        onCancel={() => setCloningId(null)}
      />

      <ConfirmDialog
        open={cancelingCourse !== null}
        title="Hủy yêu cầu duyệt"
        description={`Bạn có chắc chắn muốn hủy yêu cầu duyệt khóa học "${cancelingCourse?.title}" không? Khóa học sẽ trở về trạng thái bản nháp để bạn có thể chỉnh sửa.`}
        confirmLabel="Hủy duyệt"
        onConfirm={handleCancelReviewConfirm}
        onCancel={() => setCancelingCourse(null)}
      />
    </div>
  );
}

import { NavLink, Outlet, useParams, useNavigate } from "react-router";
import { ChevronLeft, Undo2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetCourseDetail, useCancelReview, useUpdateCourse } from "@/features/courses/hook/use-courses";
import { LEVEL_LABELS, COURSE_STATUS_CONFIG } from "@/features/courses/types/course.constants";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@fe/lib/utils";

const COURSE_TABS = [
  { label: "Tổng quan", to: "" },
  { label: "Nội dung", to: "/content" },
  { label: "Học viên", to: "/students" },
  { label: "Phân tích", to: "/analytics" },
];

export default function CourseDetailLayout() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: courseResponse, isLoading } = useGetCourseDetail(courseId);
  const course = (courseResponse as any)?.data ?? (courseResponse as any)?.data?.data;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const { mutateAsync: cancelReview, isPending: isCanceling } = useCancelReview();
  const { mutateAsync: updateCourse, isPending: isSubmitting } = useUpdateCourse();

  const statusCfg = course ? COURSE_STATUS_CONFIG[course.status] : null;
  const isPendingReview = course?.status === 2;
  const canSubmitForReview = course?.status === 1 || course?.status === 4;

  const handleCancelReview = async () => {
    if (!courseId) return;
    const tid = toast.loading("Đang thu hồi...");
    try {
      await cancelReview(courseId);
      toast.success("Đã thu hồi duyệt! Khóa học về trạng thái Bản nháp.", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    } finally {
      setConfirmCancel(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!courseId) return;

    let freshCourse: any;
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ["course", courseId],
        staleTime: 0,
      });
      freshCourse = (freshData as any)?.data ?? (freshData as any)?.data?.data ?? course;
    } catch {
      freshCourse = course;
    }

    const sections = freshCourse?.sections ?? [];
    const hasSections = sections.length > 0;
    const allSectionsHaveLessons = sections.length > 0 && sections.every((s: any) => (s.lessons ?? []).length > 0);

    if (!hasSections) {
      toast.error("Khóa học phải có ít nhất một chương trước khi gửi duyệt.");
      return;
    }
    if (!allSectionsHaveLessons) {
      toast.error("Mỗi chương phải có ít nhất một bài học trước khi gửi duyệt.");
      return;
    }

    const tid = toast.loading("Đang gửi duyệt...");
    try {
      const fd = new FormData();
      fd.append("status", "2");
      await updateCourse({ id: courseId, data: fd });
      toast.success("Đã gửi duyệt! Chờ admin phê duyệt.", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    } finally {
      setConfirmSubmit(false);
    }
  };

  return (
    <div className="px-6 py-4 space-y-4">
      {/* Back navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/courses")}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Khóa học của tôi
        </Button>
      </div>

      {/* Course header card */}
        <div className="w-fit me-0 ms-auto ">
        {isPendingReview && (
            <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setConfirmCancel(true)}
                disabled={isCanceling}
            >
              <Undo2 className="h-3.5 w-3.5 mr-1" />
              Thu hồi duyệt
            </Button>
        )}
        {canSubmitForReview && (
            <Button
                size="sm"
                className="h-8 text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
                onClick={() => setConfirmSubmit(true)}
                disabled={isSubmitting}
            >
              Gửi duyệt
            </Button>
        )}
        </div>
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-0 -mb-px">
          {COURSE_TABS.map((tab) => {
            const href = tab.to ? `/courses/${courseId}${tab.to}` : `/courses/${courseId}`;
            return (
              <NavLink
                key={tab.to}
                to={href}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "text-foreground border-b-2 border-foreground"
                      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                  )
                }
                end={tab.to === ""}
              >
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="py-2">
        <Outlet />
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Thu hồi duyệt"
        description="Khóa học sẽ về trạng thái Bản nháp. Bạn có thể chỉnh sửa và gửi duyệt lại sau."
        confirmLabel="Thu hồi"
        onConfirm={handleCancelReview}
        onCancel={() => setConfirmCancel(false)}
      />
      <ConfirmDialog
        open={confirmSubmit}
        title="Gửi duyệt"
        description="Khóa học sẽ được gửi cho admin phê duyệt. Bạn không thể chỉnh sửa khi đang chờ duyệt."
        confirmLabel="Gửi duyệt"
        onConfirm={handleSubmitForReview}
        onCancel={() => setConfirmSubmit(false)}
      />
    </div>
  );
}

import { NavLink, Outlet, useParams, useNavigate } from "react-router";
import { ChevronLeft, Eye, Undo2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetCourseDetail, useCancelReview, useCreatePreviewToken, useUpdateCourse } from "@/features/courses/hook/use-courses";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@fe/lib/utils";

const COURSE_TABS = [
  { label: "Tổng quan", to: "" },
  { label: "Nội dung", to: "/content" },
  { label: "Học viên", to: "/students" },
  { label: "Phân tích", to: "/analytics" },
];

const CLIENT_URL =
  import.meta.env.VITE_CLIENT_URL ?? "http://localhost:5173";

export default function CourseDetailLayout() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: courseResponse } = useGetCourseDetail(courseId);
  const course = (courseResponse as any)?.data ?? (courseResponse as any)?.data?.data;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const { mutateAsync: cancelReview, isPending: isCanceling } = useCancelReview();
  const { mutateAsync: updateCourse, isPending: isSubmitting } = useUpdateCourse();
  const { mutate: createPreviewToken, isPending: isPreviewing } =
    useCreatePreviewToken();

  const isPendingReview = course?.status === 2;
  const canSubmitForReview = course?.status === 1 || course?.status === 4;

  const handlePreview = () => {
    if (!courseId) return;

    const tid = toast.loading("Đang mở bản xem trước...");
    const tab = window.open("about:blank", "_blank");
    if (tab) {
      tab.document.title = "Đang mở bản xem trước...";
      tab.document.body.textContent = "Đang mở bản xem trước...";
    }

    createPreviewToken(courseId, {
      onSuccess: (res) => {
        toast.success("Đang mở bản xem trước...", {
          id: tid,
          duration: 2500,
        });
        const url = `${CLIENT_URL}/courses/preview/${res.token}`;
        if (tab) {
          tab.location.href = url;
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      },
      onError: (err) => {
        tab?.close();
        toast.error(getErrorMessage(err), { id: tid });
      },
    });
  };

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
        <div className="w-fit me-0 ms-auto flex items-center gap-2">
        <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handlePreview}
            disabled={!courseId || isPreviewing}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Xem trước
        </Button>
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

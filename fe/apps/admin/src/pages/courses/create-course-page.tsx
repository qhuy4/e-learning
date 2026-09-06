import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChevronLeft,
  Save,
  LayoutTemplate,
  ListTree,
  SendHorizonal,
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import type { Course } from "@/features/courses/types/course.types";
import { CourseInfoStep } from "@/features/courses/components/create-course/course-info-step";
import { CourseContentStep } from "@/features/courses/components/create-course/course-content-step";
import {
  useCreateCourse,
  useGetCourseDetail,
  useUpdateCourse,
  useCancelReviewCourse,
} from "@/features/courses/hook/use-courses";
import { validateCourse, validateCourseEdit } from "@/features/courses/schemas/course.schema";

import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fe/components/ui/tabs";
import { Separator } from "@fe/components/ui/separator";

const STATUS_CONFIG: Record<
  number,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  1: { label: "Bản nháp",    variant: "secondary"   },
  2: { label: "Chờ duyệt",  variant: "outline"     },
  4: { label: "Bị từ chối", variant: "destructive" },
  5: { label: "Đã xuất bản",variant: "default"     },
  6: { label: "Lưu trữ",    variant: "secondary"   },
};

export function CreateCoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const isEditMode = Boolean(courseId);

  const { mutate: createCourse, isPending: isCreating } = useCreateCourse();
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
  const { mutate: cancelReview, isPending: isCancelingReview } = useCancelReviewCourse();
  const { data: courseResponse } = useGetCourseDetail(courseId, { enabled: isEditMode });

  const isBusy = isCreating || isUpdating || isCancelingReview;

  const [courseData, setCourseData] = useState<Course>({
    title: "",
    description: "",
    price: 0,
    level: 1,
    thumbnail: undefined,
    sections: [],
    categoryId: 1,
  });

  useEffect(() => {
    if (!courseResponse?.data) return;
    setCourseData(courseResponse.data);
  }, [courseResponse]);

  const updateCourseData = (newData: Partial<Course>) =>
    setCourseData((prev) => ({ ...prev, ...newData }));

  const currentStatus = courseData.status ?? 1;
  const statusCfg = STATUS_CONFIG[currentStatus];
  const isPendingReview = isEditMode && currentStatus === 2;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCancelReview = () => {
    if (!courseId) return;
    const tid = toast.loading("Đang hủy yêu cầu duyệt...");
    cancelReview(courseId, {
      onSuccess: () => {
        toast.success("Đã hủy yêu cầu duyệt. Khóa học đã chuyển về bản nháp!", { id: tid });
        setCourseData((prev) => ({ ...prev, status: 1 }));
      },
      onError: () => toast.error("Có lỗi xảy ra khi hủy yêu cầu duyệt, vui lòng thử lại.", { id: tid }),
    });
  };

  const handleCreateDraft = () => {
    const error = validateCourse(courseData);
    if (error) {
      toast.error(error);
      return;
    }
    const tid = toast.loading("Đang lưu nháp...");
    createCourse({ ...courseData, status: 1 }, {
      onSuccess: (res) => {
        toast.success("Đã lưu nháp thành công!", { id: tid });
        navigate(`/courses/${res.data.id}`, { replace: true });
      },
      onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại.", { id: tid }),
    });
  };

  const handleCreateAndSubmit = () => {
    const error = validateCourse(courseData);
    if (error) {
      toast.error(error);
      return;
    }
    const tid = toast.loading("Đang gửi yêu cầu duyệt...");
    createCourse({ ...courseData, status: 2 }, {
      onSuccess: (res) => {
        toast.success("Đã gửi duyệt thành công!", { id: tid });
        navigate(`/courses/${res.data.id}`, { replace: true });
      },
      onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại.", { id: tid }),
    });
  };

  const handleSaveChanges = () => {
    const error = validateCourseEdit(courseData);
    if (error) {
      toast.error(error);
      return;
    }
    const tid = toast.loading("Đang lưu thay đổi...");
    updateCourse({ id: courseId!, data: courseData }, {
      onSuccess: () => toast.success("Đã lưu thay đổi!", { id: tid }),
      onError: () => toast.error("Lỗi khi lưu, vui lòng thử lại.", { id: tid }),
    });
  };

  const handleSubmitForReview = () => {
    const error = validateCourseEdit(courseData);
    if (error) {
      toast.error(error);
      return;
    }
    const tid = toast.loading("Đang gửi yêu cầu duyệt...");
    updateCourse({ id: courseId!, data: { ...courseData, status: 2 } }, {
      onSuccess: () => {
        toast.success("Đã gửi yêu cầu duyệt thành công!", { id: tid });
        navigate("/courses");
      },
      onError: () => toast.error("Lỗi khi gửi yêu cầu, vui lòng thử lại.", { id: tid }),
    });
  };

  // ─── Action buttons ────────────────────────────────────────────────────────
  const renderActions = () => {
    if (!isEditMode) {
      return (
        <>
          <Button variant="outline" onClick={handleCreateDraft} disabled={isBusy} className="px-5">
            <Save className="w-4 h-4 mr-2" />
            {isCreating ? "Đang lưu..." : "Lưu nháp"}
          </Button>
          <Button
            onClick={handleCreateAndSubmit}
            disabled={isBusy}
            className="px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
          >
            <SendHorizonal className="w-4 h-4 mr-2" />
            {isCreating ? "Đang gửi..." : "Gửi duyệt"}
          </Button>
        </>
      );
    }

    if (isPendingReview) {
      return (
        <>
          <Badge variant="outline" className="h-9 px-4 gap-1.5 text-amber-600 border-amber-300 dark:border-amber-700">
            <Clock className="w-3.5 h-3.5" />
            Đang chờ admin duyệt
          </Badge>
          <Button
            variant="outline"
            onClick={handleCancelReview}
            disabled={isBusy}
            className="px-4 text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950/40"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isCancelingReview ? "Đang hủy..." : "Hủy duyệt để chỉnh sửa"}
          </Button>
        </>
      );
    }

    return (
      <>
        <Button variant="outline" onClick={handleSaveChanges} disabled={isBusy} className="px-5">
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>

        {(currentStatus === 1 || currentStatus === 4) && (
          <Button
            onClick={handleSubmitForReview}
            disabled={isBusy}
            className="px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
          >
            <SendHorizonal className="w-4 h-4 mr-2" />
            {currentStatus === 4 ? "Gửi duyệt lại" : "Gửi duyệt"}
          </Button>
        )}

        {currentStatus === 5 && (
          <Badge className="h-9 px-4 gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã xuất bản
          </Badge>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/courses")}
          className="rounded-md hover:bg-muted shrink-0 h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight">
              {isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
            </h1>
            {isEditMode && statusCfg && (
              <Badge variant={statusCfg.variant} className="text-xs">{statusCfg.label}</Badge>
            )}
            {courseData.parentId && (
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                Đang cập nhật phiên bản mới
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEditMode
              ? "Cập nhật thông tin và nội dung khóa học của bạn."
              : "Điền thông tin để tạo khóa học mới. Sau khi tạo bạn có thể thêm bài học."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {renderActions()}
        </div>
      </div>

      {isPendingReview && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-amber-800 dark:text-amber-300 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Khóa học này đang ở trạng thái <strong>chờ admin duyệt</strong> nên không thể chỉnh sửa nội dung. Bạn có thể hủy duyệt để chuyển về bản nháp và tiếp tục chỉnh sửa.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelReview}
            disabled={isCancelingReview}
            className="shrink-0 bg-white dark:bg-amber-900/40 border-amber-300 text-amber-700 hover:bg-amber-100 dark:text-amber-200"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Hủy duyệt ngay
          </Button>
        </div>
      )}

      <Separator className="mb-6" />

      <Tabs defaultValue="info" className="w-full space-y-6">
        <TabsList className="bg-muted p-1 h-auto rounded-md flex w-fit border border-border/50">
          <TabsTrigger
            value="info"
            className="rounded-sm px-8 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 flex items-center gap-2 text-sm font-medium transition-all"
          >
            <LayoutTemplate className="w-4 h-4" />
            Thông tin khóa học
          </TabsTrigger>

          <TabsTrigger
            value="chapters"
            disabled={!courseId}
            className="rounded-sm px-8 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 flex items-center gap-2 text-sm font-medium transition-all disabled:opacity-40"
          >
            <ListTree className="w-4 h-4" />
            Chương trình học
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <CourseInfoStep data={courseData} updateData={updateCourseData} readOnly={isPendingReview} />
        </TabsContent>

        <TabsContent value="chapters" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <CourseContentStep data={courseData} updateData={updateCourseData} readOnly={isPendingReview} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

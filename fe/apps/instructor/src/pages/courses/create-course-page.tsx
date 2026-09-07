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
  Ban,
} from "lucide-react";
import { toast } from "sonner";

import type { Course } from "@/features/courses/types/course.types";
import { CourseInfoStep } from "@/features/courses/components/create-course/course-info-step";
import { CourseContentStep } from "@/features/courses/components/create-course/course-content-step";
import {
  useCreateCourse,
  useGetCourseDetail,
  useUpdateCourse,
} from "@/features/courses/hook/use-courses";

import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fe/components/ui/tabs";
import { Separator } from "@fe/components/ui/separator";

const STATUS_CONFIG: Record<
  number,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon?: React.ReactNode }
> = {
  1: { label: "Bản nháp",    variant: "secondary" },
  2: { label: "Chờ duyệt",   variant: "outline",   icon: <Clock className="w-3.5 h-3.5" /> },
  3: { label: "Đã duyệt",    variant: "default",   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  4: { label: "Bị từ chối",  variant: "destructive", icon: <Ban className="w-3.5 h-3.5" /> },
  5: { label: "Đã xuất bản", variant: "default",   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

function isEditable(status: number) {
  return status === 1 || status === 4;
}

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const isEditMode = Boolean(courseId);

  const { mutate: createCourse, isPending: isCreating } = useCreateCourse();
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
  const { data: courseResponse } = useGetCourseDetail(courseId);

  const isBusy = isCreating || isUpdating;

  const [courseData, setCourseData] = useState<Course>({
    title: "",
    description: "",
    price: 0,
    level: 1,
    thumbnail: undefined,
    sections: [],
  });

  useEffect(() => {
    if (!courseResponse?.data) return;
    setCourseData(courseResponse.data);
  }, [courseResponse]);

  const updateCourseData = (newData: Partial<Course>) =>
    setCourseData((prev) => ({ ...prev, ...newData }));

  const currentStatus = courseData.status ?? 1;
  const statusCfg = STATUS_CONFIG[currentStatus];
  const canEdit = !isEditMode || isEditable(currentStatus);

  const createFormData = (data: Course): FormData => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.level) formData.append("level", String(data.level));
    if (data.price !== undefined) formData.append("price", String(data.price));
    if (data.status) formData.append("status", String(data.status));
    if (data.thumbnail instanceof File) {
      formData.append("thumbnail", data.thumbnail);
    }
    return formData;
  };

  const handleCreateDraft = () => {
    if (!courseData.title.trim()) {
      toast.error("Vui lòng nhập tên khóa học!");
      return;
    }
    const tid = toast.loading("Đang lưu nháp...");
    const formData = createFormData(courseData);
    createCourse(formData, {
      onSuccess: (res) => {
        toast.success("Đã lưu nháp thành công!", { id: tid });
        navigate(`/courses/${res.data.id}`, { replace: true });
      },
      onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại.", { id: tid }),
    });
  };

  const handleSaveChanges = () => {
    const tid = toast.loading("Đang lưu thay đổi...");
    const formData = createFormData(courseData);
    updateCourse({ id: courseId!, data: formData }, {
      onSuccess: () => toast.success("Đã lưu thay đổi!", { id: tid }),
      onError: () => toast.error("Lỗi khi lưu, vui lòng thử lại.", { id: tid }),
    });
  };

  const handleSubmitForReview = () => {
    const sections = courseData.sections ?? [];
    const hasSections = sections.length > 0;
    const hasLessons = sections.some((s) => (s.lessons ?? []).length > 0);

    if (!hasSections) {
      toast.error("Khóa học phải có ít nhất một chương trước khi gửi duyệt.");
      return;
    }
    if (!hasLessons) {
      toast.error("Khóa học phải có ít nhất một bài học trước khi gửi duyệt.");
      return;
    }

    const tid = toast.loading("Đang gửi yêu cầu duyệt...");
    const formData = createFormData({ ...courseData, status: 2 });
    updateCourse({ id: courseId!, data: formData }, {
      onSuccess: () => {
        toast.success("Đã gửi yêu cầu duyệt thành công!", { id: tid });
        navigate("/courses");
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg[0] : (msg || "Lỗi khi gửi yêu cầu, vui lòng thử lại."), { id: tid });
      },
    });
  };

  const renderActions = () => {
    if (!isEditMode) {
      return (
        <Button variant="outline" onClick={handleCreateDraft} disabled={isBusy} className="px-5">
          <Save className="w-4 h-4 mr-2" />
          {isCreating ? "Đang lưu..." : "Tạo khóa học"}
        </Button>
      );
    }

    if (canEdit) {
      return (
        <>
          <Button variant="outline" onClick={handleSaveChanges} disabled={isBusy} className="px-5">
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          <Button
            onClick={handleSubmitForReview}
            disabled={isBusy}
            className="px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
          >
            <SendHorizonal className="w-4 h-4 mr-2" />
            {currentStatus === 4 ? "Gửi duyệt lại" : "Gửi duyệt"}
          </Button>
        </>
      );
    }

    return null;
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
              <Badge
                variant={statusCfg.variant}
                className={`text-xs gap-1.5 ${
                  currentStatus === 2 ? "text-amber-600 border-amber-300 dark:border-amber-700" :
                  currentStatus === 5 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200" :
                  ""
                }`}
              >
                {statusCfg.icon}
                {statusCfg.label}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {!isEditMode
              ? "Điền thông tin để tạo khóa học mới. Sau khi tạo bạn có thể thêm bài học."
              : canEdit
                ? "Cập nhật thông tin và nội dung khóa học của bạn."
                : currentStatus === 2
                  ? "Khóa học đang chờ admin duyệt. Bạn không thể chỉnh sửa trong lúc này."
                  : currentStatus === 5
                    ? "Khóa học đã được xuất bản. Liên hệ admin nếu cần chỉnh sửa."
                    : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {renderActions()}
        </div>
      </div>

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
          <CourseInfoStep data={courseData} updateData={canEdit ? updateCourseData : () => {}} />
        </TabsContent>

        <TabsContent value="chapters" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <CourseContentStep data={courseData} updateData={canEdit ? updateCourseData : () => {}} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

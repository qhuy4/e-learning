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
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  1: { label: "Bản nháp",    variant: "secondary"   },
  2: { label: "Chờ duyệt",  variant: "outline"     },
  3: { label: "Đã duyệt",   variant: "default"     },
  4: { label: "Bị từ chối", variant: "destructive" },
  5: { label: "Đã xuất bản",variant: "default"     },
  6: { label: "Lưu trữ",    variant: "secondary"   },
};

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

  const handleCreateAndSubmit = () => {
    if (!courseData.title.trim()) {
      toast.error("Vui lòng nhập tên khóa học!");
      return;
    }
    const tid = toast.loading("Đang gửi yêu cầu duyệt...");
    const formData = createFormData({ ...courseData, status: 2 });
    createCourse(formData, {
      onSuccess: (res) => {
        toast.success("Đã gửi duyệt thành công!", { id: tid });
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
    const tid = toast.loading("Đang gửi yêu cầu duyệt...");
    const formData = createFormData({ ...courseData, status: 2 });
    updateCourse({ id: courseId!, data: formData }, {
      onSuccess: () => {
        toast.success("Đã gửi yêu cầu duyệt thành công!", { id: tid });
        navigate("/courses");
      },
      onError: () => toast.error("Lỗi khi gửi yêu cầu, vui lòng thử lại.", { id: tid }),
    });
  };

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

        {currentStatus === 2 && (
          <Badge variant="outline" className="h-9 px-4 gap-1.5 text-amber-600 border-amber-300 dark:border-amber-700">
            <Clock className="w-3.5 h-3.5" />
            Đang chờ admin duyệt
          </Badge>
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
          <CourseInfoStep data={courseData} updateData={updateCourseData} />
        </TabsContent>

        <TabsContent value="chapters" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <CourseContentStep data={courseData} updateData={updateCourseData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

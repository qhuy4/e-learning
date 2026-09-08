import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { ChevronLeft, BookOpen, Layers } from "lucide-react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { LessonForm } from "@/features/lessons/components/lesson-form";
import { useCreateLesson, useGetLesson, useUpdateLesson } from "../hook/use-lessons";
import { useGetCourseDetail } from "@/features/courses/hook/use-courses";
import { toast } from "sonner";
import type { LessonType } from "../types/lesson.types";

export function CreateLessonPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const sectionId = searchParams.get("sectionId");
  const courseId = searchParams.get("courseId");
  const isEditing = !!id;

  const { data: lessonData, isLoading } = useGetLesson(isEditing ? Number(id) : 0);
  const { data: courseData } = useGetCourseDetail(courseId ?? undefined);
  const { mutate: createLesson, isPending: isCreating } = useCreateLesson();
  const { mutate: updateLesson, isPending: isUpdating } = useUpdateLesson();
  const isSaving = isCreating || isUpdating;

  const course = courseData?.data;
  const sections = course?.sections ?? [];
  const section = sections.find((s: any) => String(s.id) === String(sectionId));

  const toCourse = () => navigate(`/courses/${courseId}`, { state: { refresh: Date.now() } });

  const handleSave = (data: { title: string; type: LessonType; duration?: number; position?: number; content?: string; isPreview: boolean; videoSource?: File | string; thumbnail?: File | string }) => {
    if (isEditing) {
      const tid = toast.loading("Đang cập nhật bài học...");
      updateLesson(
        { id: Number(id), data: { ...data, courseId: Number(courseId) } as any },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật bài học!", { id: tid });
            toCourse();
          },
          onError: () => {
            toast.error("Có lỗi xảy ra khi cập nhật bài học.", { id: tid });
          },
        }
      );
    } else {
      if (!sectionId) {
        toast.error("Không tìm thấy ID chương.");
        return;
      }
      const tid = toast.loading("Đang tạo bài học...");
      createLesson(
        { sectionId: Number(sectionId), data: { ...data, sectionId: Number(sectionId), courseId: Number(courseId) } as any },
        {
          onSuccess: () => {
            toast.success("Đã tạo bài học thành công!", { id: tid });
            toCourse();
          },
          onError: () => {
            toast.error("Có lỗi xảy ra khi tạo bài học.", { id: tid });
          },
        }
      );
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <p>Đang tải dữ liệu bài học...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-md hover:bg-muted h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isEditing ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu hình video, tài liệu và nội dung cho bài học.
          </p>
        </div>
      </div>

      {(course || section) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Khóa học
            </Label>
            <Input value={course?.title ?? ""} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Chương
            </Label>
            <Input value={section?.title ?? ""} disabled className="bg-muted/50" />
          </div>
        </div>
      )}

      <LessonForm initialData={lessonData?.data} onSave={handleSave} onCancel={() => navigate(-1)} isSaving={isSaving} />
    </div>
  );
}

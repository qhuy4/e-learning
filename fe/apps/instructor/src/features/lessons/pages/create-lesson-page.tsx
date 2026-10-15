import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { ChevronLeft, BookOpen, Layers } from "lucide-react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { LessonForm } from "@/features/lessons/components/lesson-form";
import { useCreateLesson, useGetLesson, useUpdateLesson } from "../hook/use-lessons";
import { lessonService } from "../services/lesson.service";
import { useGetCourseDetail } from "@/features/courses/hook/use-courses";
import { toast } from "sonner";
import type { LessonType } from "../types/lesson.types";
import { getErrorMessage } from "@/shared/utils/error";

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

  const handleSave = (data: { title: string; type: LessonType; duration?: number; position?: number; content?: string; isPreview: boolean; videoSource?: File | string; thumbnail?: File | string; materials?: File[] }) => {
    if (isEditing) {
      const tid = toast.loading("Đang cập nhật bài học...");
      updateLesson(
        { id: Number(id), data: { ...data, courseId: Number(courseId) } as any },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật bài học!", { id: tid });
            toCourse();
          },
          onError: (err) => {
            toast.error(getErrorMessage(err), { id: tid });
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
          onSuccess: async (res: any) => {
            const lessonId = res?.data?.id ?? res?.id;
            const materials: File[] = data.materials ?? [];
            if (materials.length > 0 && lessonId) {
              // Bài học đã tạo xong → tải các tài liệu đính kèm lên
              toast.loading(`Đang tải ${materials.length} tài liệu lên...`, { id: tid });
              let failed = 0;
              for (const file of materials) {
                try {
                  await lessonService.uploadMaterial(Number(lessonId), file);
                } catch {
                  failed++;
                }
              }
              if (failed > 0) {
                toast.error(
                  `Đã tạo bài học, nhưng ${failed} tài liệu tải lên thất bại. Bạn có thể bổ sung sau trong trang Chỉnh sửa.`,
                  { id: tid },
                );
              } else {
                toast.success(`Đã tạo bài học và ${materials.length} tài liệu đính kèm!`, { id: tid });
              }
            } else if (materials.length > 0) {
              toast.warning(
                "Đã tạo bài học nhưng không tải được tài liệu. Hãy bổ sung trong trang Chỉnh sửa.",
                { id: tid },
              );
            } else {
              toast.success("Đã tạo bài học thành công!", { id: tid });
            }
            toCourse();
          },
          onError: (err) => {
            toast.error(getErrorMessage(err), { id: tid });
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

      {/* Luôn hiển thị (kể cả lúc đang tải) — không ẩn/hiện gây mất tên khóa học/chương */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Khóa học
          </Label>
          <Input
            value={course?.title ?? ""}
            placeholder={courseData ? "" : "Đang tải..."}
            disabled
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Chương
          </Label>
          <Input
            value={section?.title ?? ""}
            placeholder={courseData ? "" : "Đang tải..."}
            disabled
            className="bg-muted/50"
          />
        </div>
      </div>

      <LessonForm initialData={lessonData?.data} onSave={handleSave} onCancel={() => navigate(-1)} isSaving={isSaving} />
    </div>
  );
}

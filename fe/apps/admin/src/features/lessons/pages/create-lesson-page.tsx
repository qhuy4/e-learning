import { Button } from "@fe/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { LessonForm, type LessonFormData } from "@/features/lessons/components/lesson-form";
import { useCreateLesson, useGetLesson, useUpdateLesson } from "../hook/use-lessons";
import { toast } from "sonner";

export function CreateLessonPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams(); 

  const sectionId = searchParams.get("sectionId");

  const isEditing = !!id;

  const { data: lessonData, isLoading } = useGetLesson(isEditing ? Number(id) : 0);
  const { mutate: createLesson, isPending: isCreating } = useCreateLesson();
  const { mutate: updateLesson, isPending: isUpdating } = useUpdateLesson();

  const handleSave = (data: LessonFormData) => {
    if (isEditing) {
      const tid = toast.loading("Đang cập nhật bài học...");
      updateLesson(
        { id: Number(id), data },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật bài học!", { id: tid });
            navigate(-1);
          },
          onError: (error) => {
            console.error("Lỗi khi cập nhật bài học:", error);
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
        { sectionId: Number(sectionId), data },
        {
          onSuccess: () => {
            toast.success("Đã tạo bài học thành công!", { id: tid });
            navigate(-1);
          },
          onError: (error) => {
            console.error("Lỗi khi tạo bài học:", error);
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-md hover:bg-muted h-8 w-8"
        >
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

      <LessonForm 
        initialData={lessonData?.data} 
        onSave={handleSave} 
        onCancel={() => navigate(-1)} 
      />
    </div>
  );
}

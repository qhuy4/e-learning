import { Headphones, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@fe/components/ui/button";
import { useGetLessonDictations, useDetachDictationFromLesson } from "@/features/dictations/hook/use-dictations";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";

export function LessonDictationList({ lessonId, courseId, editable }: { lessonId: number, courseId: number, editable: boolean }) {
  const navigate = useNavigate();
  const { data: dictationsResponse } = useGetLessonDictations(lessonId);
  const { mutateAsync: detachDictation } = useDetachDictationFromLesson();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const dictations = (dictationsResponse as any)?.data ?? dictationsResponse ?? [];

  if (!dictations || dictations.length === 0) return null;

  const handleDetach = async () => {
    if (!confirmDelete) return;
    const tid = toast.loading("Đang gỡ bài Dictation...");
    try {
      await detachDictation({ dictationId: confirmDelete, lessonId });
      toast.success("Đã gỡ bài Dictation khỏi bài học", { id: tid });
    } catch (err: any) {
      toast.error("Lỗi khi gỡ Dictation: " + err?.message, { id: tid });
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <div className="bg-muted/10 border-b border-muted/50 pl-14 pr-4 py-2 space-y-1">
        {dictations.map((dictation: any) => (
          <div key={dictation.id} className="flex items-center gap-3 py-1.5 text-sm text-muted-foreground group">
            <Headphones className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="flex-1 truncate">Nghe chép chính tả: {dictation.title}</span>
            <span className="text-xs shrink-0">{dictation.sentences?.length || 0} câu hỏi</span>
            
            {editable && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate(`/dictations/create?lessonId=${lessonId}&courseId=${courseId}&editId=${dictation.id}`)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmDelete(dictation.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDetach}
        title="Gỡ bài tập"
        description="Bạn có chắc chắn muốn gỡ bài nghe chép chính tả này khỏi bài học? Bài tập vẫn sẽ tồn tại trong hệ thống nhưng không còn hiển thị ở bài học này."
      />
    </>
  );
}

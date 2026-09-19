import { FileQuestion, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@fe/components/ui/button";
import { useGetLessonQuizzes, useDetachQuizFromLesson } from "@/features/quizzes/hook/use-quizzes";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useState } from "react";
import { getErrorMessage } from "@/shared/utils/error";

interface LessonQuizListProps {
  lessonId: number;
  courseId: number | string;
  editable: boolean;
}

export function LessonQuizList({ lessonId, courseId, editable }: LessonQuizListProps) {
  const navigate = useNavigate();
  const { data: quizzesResponse, isLoading } = useGetLessonQuizzes(lessonId);
  const { mutateAsync: detachQuiz, isPending: isDetaching } = useDetachQuizFromLesson();
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null);

  const quizzes = (quizzesResponse as any)?.data?.data ?? (quizzesResponse as any)?.data ?? quizzesResponse ?? [];

  if (isLoading || quizzes.length === 0) return null;

  const handleDetach = async () => {
    if (!deletingQuizId) return;
    const tid = toast.loading("Đang gỡ Quiz...");
    try {
      await detachQuiz({ quizId: deletingQuizId, lessonId });
      toast.success("Đã gỡ Quiz khỏi bài học!", { id: tid });
    } catch (error) {
      toast.error(getErrorMessage(error), { id: tid });
    } finally {
      setDeletingQuizId(null);
    }
  };

  return (
    <>
      <div className="bg-muted/10 border-t border-b border-muted/50 pl-14 pr-4 py-2 space-y-1">
        {quizzes.map((quiz: any) => (
          <div key={quiz.id} className="flex items-center gap-3 py-1.5 text-sm text-muted-foreground group">
            <FileQuestion className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="flex-1 truncate">Quiz: {quiz.title}</span>
            <span className="text-xs shrink-0">{quiz.questions?.length || 0} câu hỏi</span>
            <span className="text-xs shrink-0 px-2 border-l border-muted-foreground/30">
              {quiz.timeLimit ? `${quiz.timeLimit} phút` : "Không giới hạn thời gian"}
            </span>
            
            {editable && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-foreground"
                  onClick={() => navigate(`/quizzes/${quiz.id}/edit?courseId=${courseId}&lessonId=${lessonId}`)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-destructive"
                  onClick={() => setDeletingQuizId(quiz.id)}
                  title="Gỡ Quiz khỏi bài học"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deletingQuizId}
        onCancel={() => setDeletingQuizId(null)}
        title="Gỡ Quiz"
        description="Bạn có chắc chắn muốn gỡ Quiz này khỏi bài học? Quiz vẫn sẽ tồn tại trong kho Quiz của bạn."
        onConfirm={handleDetach}
      />
    </>
  );
}

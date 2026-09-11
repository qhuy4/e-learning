import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Eye, EyeOff, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Separator } from "@fe/components/ui/separator";
import {
  useQuestion,
  useUpdateQuestionStatus,
  useDeleteQuestion,
  useUpdateAnswerStatus,
  useDeleteAnswer,
} from "@/features/questions/hooks/use-questions";
import {
  questionStatusLabel,
  questionStatusClassName,
  QuestionStatus,
} from "@/features/questions/types/question";

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div>{children}</div>
    </div>
  );
}

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: question, isLoading } = useQuestion(id ?? "");
  const updateStatusMutation = useUpdateQuestionStatus();
  const deleteMutation = useDeleteQuestion();
  const updateAnswerStatusMutation = useUpdateAnswerStatus(id ?? "");
  const deleteAnswerMutation = useDeleteAnswer(id ?? "");

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/questions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MessageCircle className="size-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Không tìm thấy câu hỏi</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Câu hỏi này không tồn tại hoặc đã bị xóa.
          </p>
          <Button className="mt-6" onClick={() => navigate("/questions")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const newStatus = question.status === QuestionStatus.VISIBLE
      ? QuestionStatus.HIDDEN
      : QuestionStatus.VISIBLE;
    const loadingId = toast.loading("Đang cập nhật...");
    updateStatusMutation.mutate(
      { id: id!, status: newStatus },
      {
        onSuccess: () => {
          toast.success(newStatus === QuestionStatus.VISIBLE ? "Đã hiển thị câu hỏi" : "Đã ẩn câu hỏi", { id: loadingId });
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Lỗi", { id: loadingId });
        },
      },
    );
  };

  const handleDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này? Tất cả câu trả lời cũng sẽ bị xóa.")) return;
    const loadingId = toast.loading("Đang xóa...");
    deleteMutation.mutate(id!, {
      onSuccess: () => {
        toast.success("Đã xóa câu hỏi", { id: loadingId });
        navigate("/questions");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Lỗi", { id: loadingId });
      },
    });
  };

  const handleToggleAnswerStatus = (answerId: string, currentStatus: number) => {
    const newStatus = currentStatus === QuestionStatus.VISIBLE
      ? QuestionStatus.HIDDEN
      : QuestionStatus.VISIBLE;
    updateAnswerStatusMutation.mutate(
      { id: answerId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(newStatus === QuestionStatus.VISIBLE ? "Đã hiển thị câu trả lời" : "Đã ẩn câu trả lời");
        },
      },
    );
  };

  const handleDeleteAnswer = (answerId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu trả lời này?")) return;
    deleteAnswerMutation.mutate(answerId, {
      onSuccess: () => {
        toast.success("Đã xóa câu trả lời");
      },
    });
  };

  return (
    <div className="p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/questions")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Chi tiết câu hỏi</h1>
          <Badge className={questionStatusClassName[question.status]}>
            {questionStatusLabel[question.status]}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleStatus} disabled={updateStatusMutation.isPending}>
            {question.status === QuestionStatus.VISIBLE ? (
              <><EyeOff className="mr-2 h-4 w-4" /> Ẩn câu hỏi</>
            ) : (
              <><Eye className="mr-2 h-4 w-4" /> Hiện câu hỏi</>
            )}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Nội dung câu hỏi">
          <Field label="Câu hỏi">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{question.content}</p>
          </Field>
          <Separator />
          <Field label="Học viên">
            <p>{question.user?.name ?? "—"}</p>
          </Field>
          <Field label="Khóa học">
            <p>{question.course?.title ?? "—"}</p>
          </Field>
        </Section>

        <div className="space-y-6">
          <Section title="Thời gian">
            <Field label="Ngày tạo">
              <p>{formatDate(question.createdAt)}</p>
            </Field>
            <Field label="Hoạt động cuối">
              <p>{formatDate(question.lastActivityAt)}</p>
            </Field>
          </Section>

          <Section title={`Câu trả lời (${question.answers?.length ?? 0})`}>
            {!question.answers || question.answers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Chưa có câu trả lời nào.
              </p>
            ) : (
              <div className="space-y-3">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={questionStatusClassName[answer.status]}>
                          {questionStatusLabel[answer.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(answer.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAnswerStatus(answer.id, answer.status)}
                        >
                          {answer.status === QuestionStatus.VISIBLE ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteAnswer(answer.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{answer.content}</p>
                    <p className="text-xs text-muted-foreground">{answer.user?.name ?? "—"}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

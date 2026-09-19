import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { useQuestionDetail, useCreateAnswer, useUpdateQuestionStatus } from "@/features/qa/hook/use-qa";
import { QUESTION_STATUS_LABELS, QUESTION_STATUS_CLASSES, ANSWER_STATUS_LABELS, ANSWER_STATUS_CLASSES } from "@/features/qa/types/qa";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");

  const { data: question, isLoading } = useQuestionDetail(Number(id));
  const createAnswer = useCreateAnswer();
  const updateStatus = useUpdateQuestionStatus();

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Đang tải...</div>;
  }

  if (!question) {
    return <div className="p-6 text-muted-foreground">Không tìm thấy câu hỏi.</div>;
  }

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    createAnswer.mutate(
      { questionId: Number(id), content: answer.trim() },
      { onSuccess: () => setAnswer("") },
    );
  };

  const handleToggleStatus = () => {
    const nextStatus = question.status === 1 ? 2 : 1;
    updateStatus.mutate({ id: Number(id), status: nextStatus });
  };

  return (
    <div className="space-y-6 mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/qa")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chi tiết câu hỏi</h1>
          <p className="text-sm text-muted-foreground">
            {question.course?.title ?? "—"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">
              {question.user?.name ?? "—"} · {question.createdAt ? new Date(question.createdAt).toLocaleDateString("vi-VN") : "—"}
            </p>
            <p className="text-base leading-relaxed">{question.content}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${QUESTION_STATUS_CLASSES[question.status] ?? ""} border-0`}>
              {QUESTION_STATUS_LABELS[question.status] ?? "—"}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleToggleStatus} disabled={updateStatus.isPending}>
              {question.status === 1 ? "Khóa" : "Mở lại"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Trả lời ({question.answers?.length ?? 0})</h2>

        {(!question.answers || question.answers.length === 0) && (
          <p className="text-sm text-muted-foreground">Chưa có trả lời nào.</p>
        )}

        {question.answers?.map((a: any) => (
          <div key={a.id} className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {a.user?.name ?? "—"} · {a.createdAt ? new Date(a.createdAt).toLocaleDateString("vi-VN") : "—"}
              </p>
              <Badge variant="outline" className={`${ANSWER_STATUS_CLASSES[a.status] ?? ""} border-0 text-xs`}>
                {ANSWER_STATUS_LABELS[a.status] ?? "—"}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">{a.content}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Viết trả lời..."
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || createAnswer.isPending}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
          >
            <Send className="h-4 w-4 mr-2" />
            Gửi trả lời
          </Button>
        </div>
      </div>
    </div>
  );
}

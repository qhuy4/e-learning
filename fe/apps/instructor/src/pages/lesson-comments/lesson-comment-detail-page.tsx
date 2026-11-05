import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import {
  useCommentThread,
  useReplyLessonComment,
} from "@/features/lesson-comments/hooks/use-lesson-comments";
import { CommentTree } from "@/features/lesson-comments/components/comment-tree";
import { LinkifiedText } from "@/features/lesson-comments/components/linkified-text";
import { formatRelativeTime, initialsOf, isThreadAnswered } from "@/features/lesson-comments/utils";
import type { CommentThread } from "@/features/lesson-comments/types/lesson-comments";
import { Button } from "@fe/components/ui/button";

export default function LessonCommentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const rootId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState("");

  const { data: threadResponse, isLoading } = useCommentThread(rootId);
  const reply = useReplyLessonComment();

  const thread: CommentThread | undefined = threadResponse?.data;

  // Quay lại đúng bộ lọc (lưu trong URL khi bấm từ danh sách)
  const from = (location.state as { from?: string } | null)?.from ?? "";
  const handleBack = () =>
    navigate(from ? `/lesson-comments${from}` : "/lesson-comments");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Đang tải bình luận...
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Không tìm thấy câu hỏi này.
        </p>
      </div>
    );
  }

  const { root, comments } = thread;
  const replies = comments.filter((c) => c.id !== root.id);
  // Đồng nhất với BE: tin nhắn cuối nhánh phải là của giảng viên.
  const answered = isThreadAnswered(comments);

  const handleReply = async (parentId: number, content: string) => {
    try {
      await reply.mutateAsync({
        lessonId: root.lessonId,
        content,
        parentId,
      });
      toast.success("Đã gửi trả lời");
    } catch {
      toast.error("Không trả lời được. Vui lòng thử lại.");
      throw new Error("reply-failed"); // giữ draft trong composer
    }
  };

  const handleSendRoot = async () => {
    const content = draft.trim();
    if (!content || reply.isPending) return;
    try {
      await handleReply(root.id, content);
      setDraft("");
    } catch {
      // handleReply đã toast lỗi
    }
  };

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleBack}
          aria-label="Quay lại danh sách"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">Chi tiết câu hỏi</h1>
          <p className="text-xs text-muted-foreground">
            Đọc toàn bộ nhánh bình luận và trả lời học viên
          </p>
        </div>
        <span
          className={
            answered
              ? "ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600"
              : "ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600"
          }
        >
          {answered ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <CircleAlert className="h-3.5 w-3.5" />
          )}
          {answered ? "Đã trả lời" : "Chưa trả lời"}
        </span>
      </div>

      {/* Ngữ cảnh: khóa › bài học */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
        <BookOpen className="h-4 w-4 shrink-0 text-primary" />
        <span className="font-medium">{root.courseTitle}</span>
        <span className="text-border">›</span>
        <span className="text-muted-foreground">{root.lessonTitle}</span>
        {/* Nhảy sang bài gốc đang được hỏi — tab mới để giữ thread */}
        <a
          href={`/lessons/${root.lessonId}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Mở bài học
        </a>
        <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
          {replies.length} trả lời
        </span>
      </div>

      {/* Câu hỏi gốc */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initialsOf(root.user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">
                {root.user?.name ?? "Học viên"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(root.createdAt)}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed">
              <LinkifiedText text={root.content} />
            </p>
          </div>
        </div>
      </div>

      {/* Các cấp trả lời */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <MessageSquare className="h-4 w-4 text-primary" />
          Tất cả bình luận
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
            {replies.length}
          </span>
        </h2>
        {replies.length > 0 ? (
          <CommentTree
            comments={replies}
            onReply={handleReply}
            isPending={reply.isPending}
          />
        ) : (
          <p className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
            Chưa có trả lời nào — hãy là người đầu tiên trả lời câu hỏi này.
          </p>
        )}
      </div>

      {/* Trả lời trực tiếp câu hỏi gốc */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <label
          htmlFor="root-reply"
          className="text-sm font-bold"
        >
          Trả lời câu hỏi
        </label>
        <textarea
          id="root-reply"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          placeholder="Viết câu trả lời của bạn..."
          className="mt-2 min-h-[100px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <div className="mt-2 flex justify-end">
          <Button
            onClick={() => void handleSendRoot()}
            disabled={!draft.trim() || reply.isPending}
          >
            {reply.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Gửi trả lời
          </Button>
        </div>
      </div>
    </div>
  );
}

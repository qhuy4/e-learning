import { useState, type ReactNode } from "react";
import { CornerDownRight, GraduationCap, Loader2, Send } from "lucide-react";
import { buildCommentTree, formatRelativeTime, initialsOf } from "@/features/lesson-comments/utils";
import { LinkifiedText } from "@/features/lesson-comments/components/linkified-text";
import type {
  CommentNode,
  LessonComment,
} from "@/features/lesson-comments/types/lesson-comments";

interface CommentTreeProps {
  /** Mảng phẳng gốc + các cấp trả lời (cũ trước) */
  comments: LessonComment[];
  /** Trả lời một comment (parentId) — resolve khi gửi xong */
  onReply: (parentId: number, content: string) => Promise<void>;
  isPending?: boolean;
}

/**
 * Cây bình luận nhiều cấp (FB/YouTube style) + trả lời inline từng comment.
 * Dùng cho trang chi tiết câu hỏi phía giảng viên.
 */
export function CommentTree({ comments, onReply, isPending }: CommentTreeProps) {
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const roots = buildCommentTree(comments);

  const handleSend = async (parentId: number) => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await onReply(parentId, content);
      setDraft("");
      setReplyToId(null);
    } catch {
      // onReply đã toast lỗi — giữ draft để người dùng gửi lại
    } finally {
      setSending(false);
    }
  };

  const renderComment = (node: CommentNode, depth: number): ReactNode => {
    const { comment, children } = node;
    const indent = depth >= 3 ? "" : "ml-5 md:ml-8";

    return (
      <li key={comment.id} className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initialsOf(comment.user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">
                {comment.user?.name ?? "Học viên"}
              </span>
              {comment.isInstructor && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  <GraduationCap className="h-3 w-3" />
                  Giảng viên
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
              <LinkifiedText text={comment.content} />
            </p>
            <button
              onClick={() => {
                setReplyToId(replyToId === comment.id ? null : comment.id);
                setDraft("");
              }}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              Trả lời
            </button>

            {replyToId === comment.id && (
              <div className="mt-3 flex flex-col items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={2000}
                  autoFocus
                  placeholder={`Trả lời ${comment.user?.name ?? ""}...`}
                  className="min-h-[56px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => void handleSend(comment.id)}
                    disabled={!draft.trim() || sending || isPending}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending || isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Gửi trả lời
                  </button>
                  <button
                    onClick={() => setReplyToId(null)}
                    className="rounded-lg border border-input bg-background px-3.5 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {children.length > 0 && (
          <ul className={`flex flex-col gap-3 ${indent}`}>
            {children.map((child) => renderComment(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul className="flex flex-col gap-4">
      {roots.map((root) => renderComment(root, 0))}
    </ul>
  );
}

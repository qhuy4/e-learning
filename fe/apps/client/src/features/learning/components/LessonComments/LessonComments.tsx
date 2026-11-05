import { useMemo, useState, type ReactNode } from 'react';
import {
  MessageSquare,
  LogIn,
  Send,
  CornerDownRight,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useLessonComments,
  useCreateLessonComment,
  useUpdateLessonComment,
  useDeleteLessonComment,
} from '../../hooks/use-learning';
import type { LessonComment } from '../../types/learning.type';

// "3 phút trước" / "2 giờ trước" — đơn giản, không cần lib ngoài.
const formatRelativeTime = (iso: string | null): string => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return 'vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${Math.floor(diffMonth / 12)} năm trước`;
};

const initialsOf = (name?: string) =>
  (name || 'HV')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'HV';

// URL trong bình luận → link bấm mở tab mới (không nhúng video — giữ thread nhẹ).
const URL_RE = /https?:\/\/[^\s<>"']+/g;

const LinkifiedText = ({ text }: { text: string }) => {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    // Tách dấu câu/dấu . dán sát cuối URL để link không bị "kèm" theo.
    const url = match[0].replace(/[.,;:!?)\]}]+$/, '');
    const trail = match[0].slice(url.length);
    nodes.push(
      <a
        key={start}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-piemind-pink underline underline-offset-2 hover:text-piemind-pink/80"
      >
        {url}
      </a>,
    );
    if (trail) nodes.push(trail);
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
};

// Cây comment — FE dựng từ mảng phẳng BE trả về.
interface CommentNode {
  comment: LessonComment;
  children: CommentNode[];
}

const buildTree = (comments: LessonComment[]): CommentNode[] => {
  const map = new Map<number, CommentNode>();
  for (const c of comments) map.set(c.id, { comment: c, children: [] });
  const roots: CommentNode[] = [];
  for (const node of map.values()) {
    const parentId = node.comment.parentId;
    if (parentId !== null && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  // Sắp xếp theo thời gian — comment cũ trước.
  const byTime = (a: CommentNode, b: CommentNode) =>
    new Date(a.comment.createdAt ?? 0).getTime() -
    new Date(b.comment.createdAt ?? 0).getTime();
  roots.sort(byTime);
  for (const r of map.values()) r.children.sort(byTime);
  return roots;
};

interface LessonCommentsProps {
  lessonId: number;
}

export const LessonComments = ({ lessonId }: LessonCommentsProps) => {
  const { user, isAuthenticated } = useAuth();
  const { data: comments, isLoading } = useLessonComments(
    lessonId,
    isAuthenticated,
  );
  const createComment = useCreateLessonComment();
  const updateComment = useUpdateLessonComment();
  const deleteComment = useDeleteLessonComment();

  const [draft, setDraft] = useState('');
  // Comment đang mở form trả lời (id).
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  // Bình luận gốc bị thu gọn ("Xem N phản hồi").
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const tree = useMemo(() => buildTree(comments ?? []), [comments]);
  const total = comments?.length ?? 0;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-piemind-pink/10 text-piemind-pink">
          <LogIn className="h-5 w-5" />
        </span>
        <p className="text-sm font-bold text-slate-600">Đăng nhập để bình luận</p>
        <p className="text-xs font-medium text-slate-400">
          Đặt câu hỏi và nhận trả lời từ giảng viên và học viên khác.
        </p>
      </div>
    );
  }

  const currentUserId = Number(user?.id);

  const handleCreate = async () => {
    const content = draft.trim();
    if (!content) return;
    try {
      await createComment.mutateAsync({ lessonId, content });
      setDraft('');
      toast.success('Đã đăng bình luận');
    } catch {
      toast.error('Không đăng được bình luận. Vui lòng thử lại.');
    }
  };

  const handleReply = async (parent: LessonComment) => {
    const content = replyDraft.trim();
    if (!content) return;
    try {
      await createComment.mutateAsync({
        lessonId,
        content,
        parentId: parent.id,
      });
      setReplyDraft('');
      setReplyToId(null);
      toast.success('Đã trả lời');
    } catch {
      toast.error('Không trả lời được. Vui lòng thử lại.');
    }
  };

  const handleUpdate = async (comment: LessonComment) => {
    const content = editDraft.trim();
    if (!content) return;
    try {
      await updateComment.mutateAsync({ id: comment.id, content, lessonId });
      setEditingId(null);
      toast.success('Đã cập nhật bình luận');
    } catch {
      toast.error('Không cập nhật được. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (comment: LessonComment) => {
    try {
      await deleteComment.mutateAsync({ id: comment.id, lessonId });
      setConfirmDeleteId(null);
      toast.success('Đã xóa bình luận');
    } catch {
      toast.error('Không xóa được bình luận. Vui lòng thử lại.');
    }
  };

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Render đệ quy — mỗi cấp thụt vào, quá 3 cấp thì không thụt thêm.
  const renderComment = (node: CommentNode, depth: number): ReactNode => {
    const { comment, children } = node;
    const isOwn = Number(comment.user?.id) === currentUserId;
    const isEditing = editingId === comment.id;
    const isExpanded = collapsed.has(comment.id);
    // Mặc định gộp quá 2 reply vào "Xem N phản hồi"; bấm vào mới mở hết.
    const shownChildren = isExpanded ? children : children.slice(0, 2);
    const hiddenCount = children.length - shownChildren.length;
    const indent = depth >= 3 ? '' : 'ml-8 md:ml-10';

    return (
      <li key={comment.id} className="flex flex-col gap-3">
        <div className="group flex items-start gap-3">
          {/* Avatar */}
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-piemind-pink/10 text-xs font-extrabold text-piemind-pink">
            {initialsOf(comment.user?.name)}
          </span>

          {isEditing ? (
            <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                maxLength={2000}
                autoFocus
                className="min-h-[60px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm focus:border-piemind-pink focus:bg-white focus:outline-none focus:ring-2 focus:ring-piemind-pink/20"
              />
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => void handleUpdate(comment)}
                  disabled={!editDraft.trim() || updateComment.isPending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-piemind-pink px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-piemind-pink/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" />
                  Lưu
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {comment.user?.name ?? 'Học viên'}
                </span>
                {comment.isInstructor && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-piemind-pink/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-piemind-pink">
                    <GraduationCap className="h-3 w-3" />
                    Giảng viên
                  </span>
                )}
                <span className="text-xs font-medium text-slate-400">
                  {formatRelativeTime(comment.createdAt)}
                  {comment.updatedAt &&
                    comment.updatedAt !== comment.createdAt &&
                    ' · đã sửa'}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                <LinkifiedText text={comment.content} />
              </p>

              {/* Actions: trả lời — với mọi người; sửa/xóa — chỉ comment của mình */}
              <div className="mt-1.5 flex items-center gap-3 text-xs font-bold">
                <button
                  onClick={() => {
                    setReplyToId(replyToId === comment.id ? null : comment.id);
                    setReplyDraft('');
                    setEditingId(null);
                    setConfirmDeleteId(null);
                  }}
                  className="inline-flex items-center gap-1 text-slate-500 transition-colors hover:text-piemind-pink"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  Trả lời
                </button>
                {isOwn && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditDraft(comment.content);
                        setReplyToId(null);
                        setConfirmDeleteId(null);
                      }}
                      className="inline-flex items-center gap-1 text-slate-500 transition-colors hover:text-slate-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                    {confirmDeleteId === comment.id ? (
                      <button
                        onClick={() => void handleDelete(comment)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-0.5 font-bold text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa?
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setConfirmDeleteId(comment.id);
                          setEditingId(null);
                          setReplyToId(null);
                        }}
                        className="inline-flex items-center gap-1 text-slate-500 transition-colors hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Form trả lời inline */}
              {replyToId === comment.id && (
                <div className="mt-3 flex items-start gap-2">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-piemind-pink/10 text-[10px] font-extrabold text-piemind-pink">
                    {initialsOf(user?.name || user?.email)}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
                    <textarea
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      maxLength={2000}
                      autoFocus
                      placeholder={`Trả lời ${comment.user?.name ?? ''}...`}
                      className="min-h-[56px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm focus:border-piemind-pink focus:bg-white focus:outline-none focus:ring-2 focus:ring-piemind-pink/20"
                    />
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => void handleReply(comment)}
                        disabled={!replyDraft.trim() || createComment.isPending}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-piemind-pink px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-piemind-pink/90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Trả lời
                      </button>
                      <button
                        onClick={() => setReplyToId(null)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Render nhánh con */}
        {children.length > 0 && (
          <ul className={`flex flex-col gap-3 ${indent}`}>
            {shownChildren.map((child) => renderComment(child, depth + 1))}
            {hiddenCount > 0 && (
              <li>
                <button
                  onClick={() => toggleCollapse(comment.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-piemind-pink transition-colors hover:text-piemind-pink/80"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Xem {hiddenCount} phản hồi
                </button>
              </li>
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Card hỏi đáp — header + bộ đếm */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-piemind-pink/10 text-piemind-pink">
            <MessageSquare className="h-4 w-4" />
          </span>
          <p className="text-sm font-extrabold text-slate-900">Hỏi đáp bài học</p>
          <span className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold tabular-nums text-slate-500">
            {total} bình luận
          </span>
        </div>

        {/* Box bình luận gốc */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-piemind-pink/10 text-xs font-extrabold text-piemind-pink">
            {initialsOf(user?.name || user?.email)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-end gap-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              placeholder="Bạn có thắc mắc gì về bài học này?"
              className="min-h-[80px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm transition-colors focus:border-piemind-pink focus:bg-white focus:outline-none focus:ring-2 focus:ring-piemind-pink/20"
            />
            <button
              onClick={() => void handleCreate()}
              disabled={!draft.trim() || createComment.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-piemind-pink px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(243,129,129,0.3)] transition-all hover:bg-piemind-pink/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createComment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Gửi câu hỏi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách bình luận */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-piemind-pink" />
          Đang tải bình luận...
        </div>
      ) : tree.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-piemind-pink/10 text-piemind-pink">
            <MessageSquare className="h-5 w-5" />
          </span>
          <p className="text-sm font-bold text-slate-600">Chưa có bình luận nào</p>
          <p className="max-w-xs text-xs font-medium text-slate-400">
            Hãy là người đầu tiên đặt câu hỏi — giảng viên sẽ trả lời trực tiếp tại đây.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {tree.map((node) => renderComment(node, 0))}
        </ul>
      )}
    </div>
  );
};

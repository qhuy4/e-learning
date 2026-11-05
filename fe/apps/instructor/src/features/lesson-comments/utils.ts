import type { CommentNode, LessonComment } from "@/features/lesson-comments/types/lesson-comments";

/** "3 phút trước" — không cần lib ngoài */
export const formatRelativeTime = (iso: string | null): string => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "vừa xong";
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

/** 2 chữ cái đầu tên (avatar tròn) */
export const initialsOf = (name?: string): string =>
  (name || "HV")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "HV";

/** Dựng cây từ mảng comment phẳng BE trả về (mỗi cấp cha → con). */
export const buildCommentTree = (comments: LessonComment[]): CommentNode[] => {
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
  return roots;
};

const timeOf = (iso: string | null): number => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Trạng thái "đã trả lời" — mirror đúng rule của BE:
 * tin nhắn CUỐI CÙNG trong nhánh phải là của giảng viên.
 * Học viên nhắn tiếp sau khi được trả lời → chờ phản hồi (chưa trả lời).
 */
export const isThreadAnswered = (comments: LessonComment[]): boolean => {
  let lastInstructor = -1;
  let lastOther = -1;
  for (const c of comments) {
    const t = timeOf(c.createdAt);
    if (c.isInstructor) lastInstructor = Math.max(lastInstructor, t);
    else lastOther = Math.max(lastOther, t);
  }
  return lastInstructor >= 0 && lastInstructor > lastOther;
};

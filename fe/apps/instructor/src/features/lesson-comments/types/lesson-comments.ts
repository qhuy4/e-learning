// Bình luận bài học — phía giảng viên:
// - Danh sách câu hỏi (bình luận gốc) + thống kê, lọc theo khóa/bài/trạng thái
// - Chi tiết một nhánh để đọc và trả lời

/** Một câu hỏi (bình luận gốc) trong danh sách */
export interface InstructorCommentItem {
  id: number;
  lessonId: number;
  lessonTitle: string;
  courseId: number;
  courseTitle: string;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  /** Số reply trong nhánh (cấp 1 + các cấp sâu hơn) */
  replyCount: number;
  /**
   * Đã trả lời = tin nhắn CUỐI CÙNG trong nhánh là của giảng viên.
   * Học viên nhắn tiếp sau đó → về lại "chưa trả lời".
   */
  answered: boolean;
  user?: { id: number; name: string };
}

/** Thống kê theo bộ lọc hiện tại (tính trên bình luận gốc) */
export interface CommentStats {
  /** Tổng số câu hỏi */
  total: number;
  /** Đã có giảng viên trả lời */
  answered: number;
  /** Chưa có giảng viên trả lời */
  unanswered: number;
}

export interface CommentListMeta {
  page: number;
  limit: number;
  /** Tổng theo bộ lọc trạng thái (để phân trang) */
  total: number;
  totalPages: number;
}

/** Response GET /instructor/lesson-comments (envelope { data, stats, meta }) */
export interface InstructorCommentListResult {
  data: InstructorCommentItem[];
  stats: CommentStats;
  meta: CommentListMeta;
}

export type CommentStatusFilter = "answered" | "unanswered";

/** Bình luận trong nhánh chi tiết (gốc + các cấp trả lời) */
export interface LessonComment {
  id: number;
  lessonId: number;
  parentId: number | null;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  /** Người viết là giảng viên của khóa → badge "Giảng viên" */
  isInstructor: boolean;
  user?: { id: number; name: string };
}

/** Response GET /instructor/lesson-comments/thread/:rootId */
export interface CommentThread {
  root: {
    id: number;
    lessonId: number;
    lessonTitle: string;
    courseId: number;
    courseTitle: string;
    content: string;
    createdAt: string | null;
    user?: { id: number; name: string };
  };
  /** Cũ trước — FE dựng cây hiển thị */
  comments: LessonComment[];
}

/** Cây comment (phải có sẵn node map — dựng từ mảng phẳng) */
export interface CommentNode {
  comment: LessonComment;
  children: CommentNode[];
}

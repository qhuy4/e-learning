export type LessonCommentStatusFilter = 'answered' | 'unanswered';

export interface InstructorLessonCommentsOptions {
  /** Lọc theo khóa (bỏ trống = mọi khóa của giảng viên) */
  courseId?: number;
  /** Lọc theo bài học (bỏ trống = mọi bài) */
  lessonId?: number;
  /** answered = đã có giảng viên trả lời, unanswered = chưa */
  status?: LessonCommentStatusFilter;
  page?: number;
  limit?: number;
}

/**
 * Danh sách câu hỏi (bình luận gốc) trong các khóa của giảng viên,
 * kèm thống kê tổng / đã trả lời / chưa trả lời.
 */
export class GetInstructorLessonCommentsQuery {
  constructor(
    public readonly instructorId: number,
    public readonly options: InstructorLessonCommentsOptions = {},
  ) {}
}

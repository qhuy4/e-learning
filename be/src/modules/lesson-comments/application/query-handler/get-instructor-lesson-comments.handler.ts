import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GetInstructorLessonCommentsQuery,
  LessonCommentStatusFilter,
} from '../query/get-instructor-lesson-comments.query';
import { LessonCommentOrmEntity } from '../../infrastructure/entity/lesson-comment.orm-entity';

export interface InstructorLessonCommentItem {
  /** Id bình luận gốc (câu hỏi) — click sang trang chi tiết để trả lời */
  id: number;
  lessonId: number;
  lessonTitle: string;
  courseId: number;
  courseTitle: string;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  /** Số reply trong nhánh (cấp 1 + cấp sâu hơn) */
  replyCount: number;
  /**
   * Đã trả lời = tin nhắn CUỐI CÙNG trong nhánh là của giảng viên.
   * Học viên nhắn tiếp sau đó → quay về "chưa trả lời" (đang chờ phản hồi).
   */
  answered: boolean;
  user?: { id: number; name: string };
}

export interface InstructorLessonCommentsStats {
  /** Tổng số câu hỏi (bình luận gốc) theo bộ lọc hiện tại */
  total: number;
  /** Đã trả lời (tin nhắn cuối nhánh là của giảng viên) */
  answered: number;
  /** Chưa trả lời (tin nhắn cuối là của học viên — chờ giảng viên phản hồi) */
  unanswered: number;
}

export interface InstructorLessonCommentsResult {
  /** Bình luận gốc (câu hỏi) theo trang */
  data: InstructorLessonCommentItem[];
  stats: InstructorLessonCommentsStats;
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/** CTE dựng cây nhánh từ bình luận gốc — dùng chung cho stats và list. */
const THREAD_CTE = `
  RECURSIVE roots AS (
    SELECT c.id, c.lesson_id, c.user_id, c.content, c.created_at, c.updated_at,
           l.title AS lesson_title, s.course_id, co.title AS course_title,
           u.name AS user_name
    FROM lesson_comments c
    JOIN lessons l ON l.id = c.lesson_id
    JOIN sections s ON s.id = l.section_id
    JOIN courses co ON co.id = s.course_id
    JOIN users u ON u.id = c.user_id
    WHERE co.instructor_id = $1::bigint
      AND c.parent_id IS NULL
      AND ($2::bigint IS NULL OR s.course_id = $2::bigint)
      AND ($3::bigint IS NULL OR c.lesson_id = $3::bigint)
  ),
  thread AS (
    SELECT r.id AS comment_id, r.id AS root_id, r.user_id, r.created_at
    FROM roots r
    UNION ALL
    SELECT lc.id, th.root_id, lc.user_id, lc.created_at
    FROM lesson_comments lc
    JOIN thread th ON lc.parent_id = th.comment_id
  ),
  agg AS (
    SELECT root_id,
           count(*) - 1 AS reply_count,
           max(created_at) FILTER (WHERE user_id = $1::bigint) AS last_instructor_at,
           max(created_at) FILTER (WHERE user_id <> $1::bigint) AS last_other_at
    FROM thread
    GROUP BY root_id
  ),
  status AS (
    SELECT root_id, reply_count,
           (last_instructor_at IS NOT NULL
             AND (last_other_at IS NULL OR last_instructor_at > last_other_at)
           ) AS answered
    FROM agg
  )
`;

@QueryHandler(GetInstructorLessonCommentsQuery)
export class GetInstructorLessonCommentsHandler
  implements IQueryHandler<GetInstructorLessonCommentsQuery>
{
  constructor(
    @InjectRepository(LessonCommentOrmEntity)
    private readonly commentRepo: Repository<LessonCommentOrmEntity>,
  ) {}

  async execute(
    query: GetInstructorLessonCommentsQuery,
  ): Promise<InstructorLessonCommentsResult> {
    const { instructorId, options } = query;
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 10));
    const courseId = options.courseId ?? null;
    const lessonId = options.lessonId ?? null;
    const status: LessonCommentStatusFilter | null = options.status ?? null;

    // Stats (không phân trang) chạy song song với trang danh sách.
    const statsSql = `
      WITH ${THREAD_CTE}
      SELECT
        (SELECT count(*) FROM roots) AS total,
        count(*) FILTER (WHERE answered) AS answered
      FROM status
    `;

    const listSql = `
      WITH ${THREAD_CTE}
      SELECT r.id, r.lesson_id, r.user_id, r.content, r.created_at, r.updated_at,
             r.lesson_title, r.course_id, r.course_title, r.user_name,
             st.reply_count, st.answered
      FROM roots r
      JOIN status st ON st.root_id = r.id
      WHERE ($4::text IS NULL
          OR ($4 = 'answered' AND st.answered)
          OR ($4 = 'unanswered' AND NOT st.answered))
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $5 OFFSET $6
    `;

    const [statsRows, listRows] = await Promise.all([
      this.commentRepo.query(statsSql, [instructorId, courseId, lessonId]),
      this.commentRepo.query(listSql, [
        instructorId,
        courseId,
        lessonId,
        status,
        limit,
        (page - 1) * limit,
      ]),
    ]);

    const stats: InstructorLessonCommentsStats = {
      total: Number(statsRows[0]?.total ?? 0),
      answered: Number(statsRows[0]?.answered ?? 0),
      unanswered: 0,
    };
    stats.unanswered = stats.total - stats.answered;

    // Tổng theo bộ lọc trạng thái (stats là của mọi trạng thái).
    const total =
      status === 'answered'
        ? stats.answered
        : status === 'unanswered'
          ? stats.unanswered
          : stats.total;

    return {
      data: listRows.map((r: any) => this.toItem(r)),
      stats,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private toItem(row: any): InstructorLessonCommentItem {
    return {
      id: Number(row.id),
      lessonId: Number(row.lesson_id),
      lessonTitle: row.lesson_title,
      courseId: Number(row.course_id),
      courseTitle: row.course_title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      replyCount: Number(row.reply_count),
      answered: Boolean(row.answered),
      user: row.user_id
        ? { id: Number(row.user_id), name: row.user_name }
        : undefined,
    };
  }
}

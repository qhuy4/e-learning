import { HttpStatus } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLessonCommentThreadQuery } from '../query/get-lesson-comment-thread.query';
import { LessonCommentOrmEntity } from '../../infrastructure/entity/lesson-comment.orm-entity';
import { LessonCommentResponse } from './get-lesson-comments.handler';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

export interface LessonCommentThreadRoot {
  id: number;
  lessonId: number;
  lessonTitle: string;
  courseId: number;
  courseTitle: string;
  content: string;
  createdAt: Date | null;
  user?: { id: number; name: string };
}

export interface LessonCommentThreadResponse {
  root: LessonCommentThreadRoot;
  /** Bình luận gốc + toàn bộ reply, sắp xếp cũ trước — FE dựng cây hiển thị. */
  comments: LessonCommentResponse[];
}

/**
 * Chi tiết một nhánh bình luận (câu hỏi): danh sách đầy đủ các cấp
 * để giảng viên đọc và trả lời. Chỉ giảng viên của khóa chứa bài học mới xem được.
 */
@QueryHandler(GetLessonCommentThreadQuery)
export class GetLessonCommentThreadHandler
  implements IQueryHandler<GetLessonCommentThreadQuery>
{
  constructor(
    @InjectRepository(LessonCommentOrmEntity)
    private readonly commentRepo: Repository<LessonCommentOrmEntity>,
  ) {}

  async execute(
    query: GetLessonCommentThreadQuery,
  ): Promise<LessonCommentThreadResponse> {
    const sql = `
      WITH RECURSIVE thread AS (
        SELECT id FROM lesson_comments WHERE id = $1::bigint
        UNION ALL
        SELECT lc.id FROM lesson_comments lc JOIN thread t ON lc.parent_id = t.id
      )
      SELECT c.id, c.parent_id, c.user_id, c.content, c.created_at, c.updated_at,
             u.name AS user_name,
             l.id AS lesson_id, l.title AS lesson_title,
             s.course_id, co.title AS course_title,
             (c.user_id = $2::bigint) AS is_instructor
      FROM lesson_comments c
      JOIN thread t ON t.id = c.id
      JOIN users u ON u.id = c.user_id
      JOIN lessons l ON l.id = c.lesson_id
      JOIN sections s ON s.id = l.section_id
      JOIN courses co ON co.id = s.course_id
      WHERE co.instructor_id = $2::bigint
      ORDER BY c.created_at ASC, c.id ASC
    `;

    const rows: any[] = await this.commentRepo.query(sql, [
      query.rootId,
      query.instructorId,
    ]);

    // Không tồn tại hoặc thuộc khóa khác → 404 (không tiết lộ sự tồn tại).
    if (rows.length === 0) {
      throw new AppException(
        ErrorCode.LESSON_COMMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const comments: LessonCommentResponse[] = rows.map((r) => ({
      id: Number(r.id),
      lessonId: Number(r.lesson_id),
      parentId: r.parent_id !== null ? Number(r.parent_id) : null,
      content: r.content,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      isInstructor: Boolean(r.is_instructor),
      user: r.user_id
        ? { id: Number(r.user_id), name: r.user_name }
        : undefined,
    }));

    const rootRow = rows.find((r) => Number(r.id) === query.rootId) ?? rows[0];
    return {
      root: {
        id: Number(rootRow.id),
        lessonId: Number(rootRow.lesson_id),
        lessonTitle: rootRow.lesson_title,
        courseId: Number(rootRow.course_id),
        courseTitle: rootRow.course_title,
        content: rootRow.content,
        createdAt: rootRow.created_at,
        user: rootRow.user_id
          ? { id: Number(rootRow.user_id), name: rootRow.user_name }
          : undefined,
      },
      comments,
    };
  }
}

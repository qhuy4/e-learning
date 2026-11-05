import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  GetInstructorLessonCommentsQuery,
  LessonCommentStatusFilter,
} from '../application/query/get-instructor-lesson-comments.query';
import { GetLessonCommentThreadQuery } from '../application/query/get-lesson-comment-thread.query';
import { InstructorLessonCommentsResult } from '../application/query-handler/get-instructor-lesson-comments.handler';
import { LessonCommentThreadResponse } from '../application/query-handler/get-lesson-comment-thread.handler';

/** Giảng viên xem + trả lời bình luận trong các bài học của khóa mình. */
@Controller('instructor/lesson-comments')
@UseGuards(JwtAuthGuard)
export class InstructorLessonCommentsController {
  constructor(private readonly queryBus: QueryBus) {}

  /** Danh sách câu hỏi (bình luận gốc) + thống kê, lọc theo khóa/bài/trạng thái. */
  @Get()
  async getList(
    @CurrentUser('id') instructorId: number,
    @Query('courseId') courseId?: string,
    @Query('lessonId') lessonId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<InstructorLessonCommentsResult> {
    return this.queryBus.execute(
      new GetInstructorLessonCommentsQuery(instructorId, {
        courseId: courseId ? Number(courseId) : undefined,
        lessonId: lessonId ? Number(lessonId) : undefined,
        status:
          status === 'answered' || status === 'unanswered'
            ? (status as LessonCommentStatusFilter)
            : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      }),
    );
  }

  /** Chi tiết một nhánh bình luận (gốc + các cấp trả lời). */
  @Get('thread/:rootId')
  async getThread(
    @CurrentUser('id') instructorId: number,
    @Param('rootId', ParseIntPipe) rootId: number,
  ): Promise<LessonCommentThreadResponse> {
    return this.queryBus.execute(
      new GetLessonCommentThreadQuery(instructorId, rootId),
    );
  }
}

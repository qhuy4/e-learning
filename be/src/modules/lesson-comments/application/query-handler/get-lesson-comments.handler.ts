import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLessonCommentsQuery } from '../query/get-lesson-comments.query';
import { LessonCommentOrmEntity } from '../../infrastructure/entity/lesson-comment.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

export interface LessonCommentResponse {
  id: number;
  lessonId: number;
  parentId: number | null;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  /** Người viết là giảng viên của khóa → FE hiện badge "Giảng viên" */
  isInstructor: boolean;
  user?: { id: number; name: string };
}

@QueryHandler(GetLessonCommentsQuery)
export class GetLessonCommentsHandler
  implements IQueryHandler<GetLessonCommentsQuery>
{
  constructor(
    @InjectRepository(LessonCommentOrmEntity)
    private readonly commentRepo: Repository<LessonCommentOrmEntity>,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepo: Repository<LessonOrmEntity>,
  ) {}

  async execute(query: GetLessonCommentsQuery): Promise<LessonCommentResponse[]> {
    const instructorId = await this.getCourseInstructorId(query.lessonId);

    const entities = await this.commentRepo.find({
      where: { lessonId: query.lessonId },
      relations: { user: true },
      order: { createdAt: 'ASC', id: 'ASC' },
    });

    return entities.map((c) => ({
      id: Number(c.id),
      lessonId: Number(c.lessonId),
      parentId: c.parentId !== null ? Number(c.parentId) : null,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      isInstructor: instructorId !== null && Number(c.userId) === instructorId,
      user: c.user
        ? {
            id: Number(c.user.id),
            name: c.user.name,
          }
        : undefined,
    }));
  }

  private async getCourseInstructorId(lessonId: number): Promise<number | null> {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId.toString() },
      relations: { section: { course: true } },
    });
    return lesson?.section?.course
      ? Number(lesson.section.course.instructorId)
      : null;
  }
}

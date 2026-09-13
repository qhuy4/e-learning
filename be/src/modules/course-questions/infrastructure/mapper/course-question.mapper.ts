import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';
import { CourseQuestion } from '@/modules/course-questions/domain/entity/course-question.entity';

export class CourseQuestionMapper {
  static toDomain(entity: CourseQuestionOrmEntity): CourseQuestion {
    return CourseQuestion.restore({
      id: Number(entity.id),
      courseId: Number(entity.courseId),
      userId: Number(entity.userId),
      content: entity.content,
      status: entity.status,
      lastActivityAt: entity.lastActivityAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      course: entity.course
        ? { id: Number(entity.course.id), title: entity.course.title }
        : undefined,
      user: entity.user
        ? { id: Number(entity.user.id), name: entity.user.name }
        : undefined,
      answers: entity.answers?.map((a) => ({
        id: Number(a.id),
        questionId: Number(a.questionId),
        userId: Number(a.userId),
        content: a.content,
        status: a.status,
        createdAt: a.createdAt,
        user: a.user ? { id: Number(a.user.id), name: a.user.name } : undefined,
      })),
      answerCount: entity.answers?.length ?? 0,
    });
  }
}

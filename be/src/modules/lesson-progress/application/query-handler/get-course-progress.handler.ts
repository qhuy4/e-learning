import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCourseProgressQuery } from '../query/get-course-progress.query';
import { ILessonProgressRepository } from '../../domain/repository/lesson-progress.repository';
import { LESSON_PROGRESS_REPOSITORY } from '../../domain/repository/lesson-progress.repository';
@QueryHandler(GetCourseProgressQuery)
export class GetCourseProgressHandler implements IQueryHandler<GetCourseProgressQuery> {
  constructor(
    @Inject(LESSON_PROGRESS_REPOSITORY)
    private readonly lessonProgressRepository: ILessonProgressRepository,
  ) {}

  async execute(query: GetCourseProgressQuery) {
    const progresses = await this.lessonProgressRepository.findByUserAndCourse(
      query.userId,
      query.courseId,
    );

    const completedLessons = progresses.filter(
      (progress) => progress.isCompleted,
    ).length;

    return {
      courseId: query.courseId,
      totalProgress: progresses.length
        ? Math.round(
            progresses.reduce(
              (sum, progress) => sum + progress.progressPercent,
              0,
            ) / progresses.length,
          )
        : 0,
      completedLessons,
      lessons: progresses,
    };
  }
}

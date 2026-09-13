import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCourseProgressQuery } from '../query/get-course-progress.query';
import { ILessonProgressRepository, LESSON_PROGRESS_REPOSITORY } from '../../domain/repository/lesson-progress.repository';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

@QueryHandler(GetCourseProgressQuery)
export class GetCourseProgressHandler implements IQueryHandler<GetCourseProgressQuery> {
  constructor(
    @Inject(LESSON_PROGRESS_REPOSITORY)
    private readonly lessonProgressRepository: ILessonProgressRepository,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepository: Repository<LessonOrmEntity>,
  ) {}

  async execute(query: GetCourseProgressQuery) {
    const [progresses, allLessons] = await Promise.all([
      this.lessonProgressRepository.findByUserAndCourse(query.userId, query.courseId),
      this.lessonRepository
        .createQueryBuilder('lesson')
        .innerJoin('lesson.section', 'section')
        .where('section.courseId = :courseId', { courseId: query.courseId.toString() })
        .select('lesson.id', 'id')
        .addSelect('lesson.duration', 'duration')
        .getRawMany<{ id: number; duration: number | null }>(),
    ]);

    const completedLessons = progresses.filter((p) => p.isCompleted).length;

    const totalCourseSeconds = allLessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    const totalWatchedSeconds = progresses.reduce((sum, p) => sum + p.watchSeconds, 0);

    const totalProgress = totalCourseSeconds > 0
      ? Math.min(Math.round((totalWatchedSeconds / totalCourseSeconds) * 100), 100)
      : 0;

    return {
      courseId: query.courseId,
      totalProgress,
      completedLessons,
      totalLessons: allLessons.length,
      lessons: progresses,
    };
  }
}

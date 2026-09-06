import { LessonProgress } from '../entity/lesson-progress.entity';

export const LESSON_PROGRESS_REPOSITORY = Symbol('LESSON_PROGRESS_REPOSITORY');
export abstract class ILessonProgressRepository {
  abstract findByUserAndLesson(
    userId: number,
    lessonId: number,
  ): Promise<LessonProgress | null>;
  abstract findByUserAndCourse(
    userId: number,
    courseId: number,
  ): Promise<LessonProgress[]>;
  abstract create(lessonProgress: LessonProgress): Promise<LessonProgress>;

  abstract update(lessonProgress: LessonProgress): Promise<LessonProgress>;
}

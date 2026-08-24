import { Lesson } from '../entity/lesson.entity';

export const LESSON_REPOSITORY = Symbol('LESSON_REPOSITORY');

export interface ILessonRepository {
  findById(id: number): Promise<Lesson | null>;

  findBySlug(sectionId: number, slug: string): Promise<Lesson | null>;

  create(lesson: Lesson): Promise<Lesson>;

  update(lesson: Lesson): Promise<Lesson>;

  delete(id: number): Promise<void>;
}

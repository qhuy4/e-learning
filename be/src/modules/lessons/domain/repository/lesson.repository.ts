import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';

export const LESSON_REPOSITORY = Symbol('LESSON_REPOSITORY');

export interface ILessonRepository {
  findById(id: number): Promise<Lesson | null>;
  findBySlug(sectionId: number, slug: string): Promise<Lesson | null>;
  findGlobalBySlug(slug: string, courseSlug?: string): Promise<Lesson | null>;
  create(lesson: Lesson): Promise<Lesson>;
  update(lesson: Lesson): Promise<Lesson>;
  delete(id: number): Promise<void>;
  findBySectionId(sectionId: number): Promise<Lesson[]>;
}

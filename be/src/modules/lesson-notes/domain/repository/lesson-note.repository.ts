import { LessonNote } from '../entity/lesson-note.entity';

export const LESSON_NOTE_REPOSITORY = Symbol('LESSON_NOTE_REPOSITORY');
export abstract class ILessonNoteRepository {
  abstract findByUserAndLesson(
    userId: number,
    lessonId: number,
  ): Promise<LessonNote[]>;
  abstract findByIdForUser(
    id: number,
    userId: number,
  ): Promise<LessonNote | null>;
  abstract create(note: LessonNote): Promise<LessonNote>;
  abstract update(note: LessonNote): Promise<LessonNote>;
  abstract delete(id: number): Promise<void>;
}

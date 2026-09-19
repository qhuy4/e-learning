export const LESSON_DICTATION_REPOSITORY = 'LESSON_DICTATION_REPOSITORY';
export interface ILessonDictationRepository {
  create(lessonId: number, dictationId: number): Promise<void>;
  delete(lessonId: number, dictationId: number): Promise<void>;
  findByLessonId(lessonId: number): Promise<any[]>;
}

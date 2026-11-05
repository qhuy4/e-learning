import { LessonComment } from '../entity/lesson-comment.entity';

export const LESSON_COMMENT_REPOSITORY = Symbol('LESSON_COMMENT_REPOSITORY');
export abstract class ILessonCommentRepository {
  abstract findById(id: number): Promise<LessonComment | null>;
  abstract create(comment: LessonComment): Promise<LessonComment>;
  abstract update(comment: LessonComment): Promise<LessonComment>;
  abstract delete(id: number): Promise<void>;
}

import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lesson_quizzes', schema: 'public' })
export class LessonQuizOrmEntity {
  @PrimaryColumn({ name: 'lesson_id', type: 'bigint' })
  lessonId: string;

  @PrimaryColumn({ name: 'quiz_id', type: 'bigint' })
  quizId: string;
}

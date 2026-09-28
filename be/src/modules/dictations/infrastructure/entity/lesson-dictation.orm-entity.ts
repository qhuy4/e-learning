import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lesson_dictations', schema: 'public' })
export class LessonDictationOrmEntity {
  @PrimaryColumn({ name: 'lesson_id', type: 'bigint' })
  lessonId: string;

  @PrimaryColumn({ name: 'dictation_id', type: 'bigint' })
  dictationId: string;
}

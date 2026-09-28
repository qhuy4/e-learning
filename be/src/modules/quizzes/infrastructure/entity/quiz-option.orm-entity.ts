import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'quiz_options', schema: 'public' })
@Index('idx_quiz_options_question_id', ['questionId'])
export class QuizOptionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'question_id', type: 'bigint' })
  questionId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ type: 'integer' })
  position: number;
}

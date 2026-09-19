import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity({ name: 'quiz_answers', schema: 'public' })
@Index('idx_quiz_answers_attempt_id', ['attemptId'])
@Index('idx_quiz_answers_question_id', ['questionId'])
@Unique(['attemptId', 'questionId'])
export class QuizAnswerOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'attempt_id', type: 'bigint' })
  attemptId: string;

  @Column({ name: 'question_id', type: 'bigint' })
  questionId: string;

  @Column({ name: 'selected_option_id', type: 'bigint', nullable: true })
  selectedOptionId: string | null;

  @Column({ name: 'answer_text', type: 'text', nullable: true })
  answerText: string | null;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ name: 'earned_points', type: 'integer', default: 0 })
  earnedPoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

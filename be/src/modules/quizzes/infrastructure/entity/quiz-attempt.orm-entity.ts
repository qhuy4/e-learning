import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { QuizAttemptStatus } from '../../domain/enums/quiz-attempt-status.enum';

@Entity({ name: 'quiz_attempts', schema: 'public' })
@Index('idx_quiz_attempts_quiz_id', ['quizId'])
@Index('idx_quiz_attempts_user_id', ['userId'])
export class QuizAttemptOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'quiz_id', type: 'bigint' })
  quizId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @Column({ name: 'correct_count', type: 'integer', default: 0 })
  correctCount: number;

  @Column({ name: 'total_questions', type: 'integer', default: 0 })
  totalQuestions: number;

  @Column({ type: 'enum', enum: QuizAttemptStatus, default: QuizAttemptStatus.IN_PROGRESS })
  status: QuizAttemptStatus;

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

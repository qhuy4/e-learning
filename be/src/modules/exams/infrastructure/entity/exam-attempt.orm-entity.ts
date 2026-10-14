import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamOrmEntity } from './exam.orm-entity';
import { ExamAttemptStatus } from '../../domain/enums/exam-attempt-status.enum';

@Entity({ name: 'exam_attempts', schema: 'public' })
export class ExamAttemptOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'exam_id', type: 'bigint' })
  examId: string;

  @ManyToOne(() => ExamOrmEntity)
  @JoinColumn({ name: 'exam_id' })
  exam: ExamOrmEntity;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  score: number;

  @Column({ name: 'correct_count', type: 'integer', default: 0 })
  correctCount: number;

  @Column({ name: 'total_questions', type: 'integer', default: 0 })
  totalQuestions: number;

  @Column({ type: 'enum', enum: ExamAttemptStatus, default: ExamAttemptStatus.IN_PROGRESS })
  status: ExamAttemptStatus;

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

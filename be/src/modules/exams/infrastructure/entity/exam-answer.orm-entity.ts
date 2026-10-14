import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamAttemptOrmEntity } from './exam-attempt.orm-entity';
import { ExamQuestionOrmEntity } from './exam-question.orm-entity';
import { ExamOptionOrmEntity } from './exam-option.orm-entity';

@Entity({ name: 'exam_answers', schema: 'public' })
export class ExamAnswerOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'attempt_id', type: 'bigint' })
  attemptId: string;

  @ManyToOne(() => ExamAttemptOrmEntity)
  @JoinColumn({ name: 'attempt_id' })
  attempt: ExamAttemptOrmEntity;

  @Column({ name: 'question_id', type: 'bigint' })
  questionId: string;

  @ManyToOne(() => ExamQuestionOrmEntity)
  @JoinColumn({ name: 'question_id' })
  question: ExamQuestionOrmEntity;

  @Column({ name: 'selected_option_id', type: 'bigint', nullable: true })
  selectedOptionId: string | null;

  @ManyToOne(() => ExamOptionOrmEntity)
  @JoinColumn({ name: 'selected_option_id' })
  selectedOption: ExamOptionOrmEntity | null;

  @Column({ name: 'answer_text', type: 'text', nullable: true })
  answerText: string | null;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ name: 'earned_points', type: 'decimal', precision: 8, scale: 2, default: 0 })
  earnedPoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

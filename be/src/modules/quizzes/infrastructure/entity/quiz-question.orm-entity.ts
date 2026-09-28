import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';

@Entity({ name: 'quiz_questions', schema: 'public' })
@Index('idx_quiz_questions_quiz_id', ['quizId'])
export class QuizQuestionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'quiz_id', type: 'bigint' })
  quizId: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'enum', enum: QuizQuestionType, default: QuizQuestionType.MULTIPLE_CHOICE })
  type: QuizQuestionType;

  @Column({ name: 'audio_url', type: 'text', nullable: true })
  audioUrl: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @Column({ type: 'integer', default: 1 })
  points: number;

  @Column({ type: 'integer' })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

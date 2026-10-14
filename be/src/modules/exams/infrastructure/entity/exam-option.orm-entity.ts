import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamQuestionOrmEntity } from './exam-question.orm-entity';

@Entity({ name: 'exam_options', schema: 'public' })
export class ExamOptionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'question_id', type: 'bigint' })
  questionId: string;

  @ManyToOne(() => ExamQuestionOrmEntity)
  @JoinColumn({ name: 'question_id' })
  question: ExamQuestionOrmEntity;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ type: 'integer' })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

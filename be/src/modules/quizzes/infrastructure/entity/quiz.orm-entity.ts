import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { LessonQuizOrmEntity } from './lesson-quiz.orm-entity';
import { QuizQuestionOrmEntity } from './quiz-question.orm-entity';
import { QuizAttemptOrmEntity } from './quiz-attempt.orm-entity';

@Entity({ name: 'quizzes', schema: 'public' })
export class QuizOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ name: 'time_limit', type: 'integer', nullable: true })
  timeLimit: number | null;

  @Column({ name: 'passing_score', type: 'integer', default: 0 })
  passingScore: number;

  @Column({ name: 'max_attempts', type: 'integer', default: 1 })
  maxAttempts: number;

  @Column({ name: 'shuffle_questions', type: 'boolean', default: false })
  shuffleQuestions: boolean;

  @Column({ name: 'shuffle_options', type: 'boolean', default: false })
  shuffleOptions: boolean;

  @Column({ name: 'show_answer_after_submit', type: 'boolean', default: true })
  showAnswerAfterSubmit: boolean;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

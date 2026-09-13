import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';

@Entity({ name: 'course_question_answers', schema: 'public' })
export class CourseQuestionAnswerOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'question_id', type: 'bigint' })
  questionId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'status', type: 'smallint', default: 1 })
  status: number;

  @ManyToOne(() => CourseQuestionOrmEntity, (q) => q.answers)
  @JoinColumn({ name: 'question_id' })
  question: CourseQuestionOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}

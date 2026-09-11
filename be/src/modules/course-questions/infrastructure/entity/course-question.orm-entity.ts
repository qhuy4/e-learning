import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { CourseQuestionAnswerOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question-answer.orm-entity';

@Entity({ name: 'course_questions', schema: 'public' })
export class CourseQuestionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'status', type: 'smallint', default: 1 })
  status: number;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt: Date | null;

  @ManyToOne(() => CourseOrmEntity)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @OneToMany(() => CourseQuestionAnswerOrmEntity, (a) => a.question)
  answers: CourseQuestionAnswerOrmEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}

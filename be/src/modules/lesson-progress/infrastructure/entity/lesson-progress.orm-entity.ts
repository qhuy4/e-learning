import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('lesson_progress')
@Unique(['userId', 'lessonId'])
export class LessonProgressOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: number;

  @Column({ name: 'lesson_id', type: 'bigint' })
  lessonId: number;

  @Column({ name: 'watch_seconds', default: 0 })
  watchSeconds: number;

  @Column({ name: 'progress_percent', type: 'smallint', default: 0 })
  progressPercent: number;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('course_views')
@Index('idx_course_views_course_id', ['courseId'])
@Index('idx_course_views_viewed_at', ['viewedAt'])
@Index('idx_course_views_course_viewed', ['courseId', 'viewedAt'])
export class CourseViewOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: number;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: number | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'viewed_at', type: 'timestamp' })
  viewedAt: Date;
}

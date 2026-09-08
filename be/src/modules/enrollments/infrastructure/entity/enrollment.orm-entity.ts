import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';

@Entity({ name: 'enrollments', schema: 'public' })
export class EnrollmentOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @Column({ name: 'status', type: 'smallint', default: 1 })
  status: number;

  @Column({ name: 'progress', type: 'smallint', default: 0 })
  progress: number;

  @Column({ name: 'price_paid', type: 'numeric', precision: 10, scale: 2, nullable: true })
  pricePaid: string | null;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'enrolled_at', type: 'timestamp', nullable: true })
  enrolledAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => CourseOrmEntity)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;
}

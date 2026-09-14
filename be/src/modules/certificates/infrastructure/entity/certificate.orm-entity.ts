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
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';

@Entity({ name: 'certificates', schema: 'public' })
export class CertificateOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @Column({ name: 'enrollment_id', type: 'bigint' })
  enrollmentId: string;

  @Column({ name: 'cert_code', type: 'uuid' })
  certCode: string;

  @Column({ name: 'issued_at', type: 'timestamp' })
  issuedAt: Date;

  @Column({ name: 'pdf_url', type: 'varchar', length: 255 })
  pdfUrl: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => CourseOrmEntity)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}

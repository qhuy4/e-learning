import {
  Column,
  Entity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';
@Entity({
  name: 'courses',
  schema: 'public',
})
@Index('idx_courses_slug', ['slug'])
@Index('idx_courses_status', ['status'])
@Index('idx_courses_instructor_id', ['instructorId'])
@Index('idx_courses_deleted_at', ['deletedAt'])
export class CourseOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: string;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructorId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string | null;

  @Column({ type: 'smallint', default: 1 })
  level: number;

  @Column({
    name: 'cefr_level_start',
    type: 'varchar',
    length: 8,
    nullable: true,
  })
  cefrLevelStart: string | null;

  @Column({
    name: 'cefr_level_end',
    type: 'varchar',
    length: 8,
    nullable: true,
  })
  cefrLevelEnd: string | null;

  @Column({ name: 'skill_codes', type: 'jsonb', default: () => "'[]'::jsonb" })
  skillCodes: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  benefits: string[];

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  price: string;

  @Column({ type: 'smallint', default: 1 })
  status: CourseStatus;

  @Column({ name: 'reviewed_by', type: 'bigint', nullable: true })
  reviewedBy: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason: string | null;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId: string | null;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => SectionOrmEntity, (section) => section.course)
  sections: SectionOrmEntity[];

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'instructor_id' })
  instructorUser: UserOrmEntity | null;
}

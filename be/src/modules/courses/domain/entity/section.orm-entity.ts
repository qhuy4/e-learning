import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { CourseOrmEntity } from './course.orm-entity';
import { LessonOrmEntity } from './lesson.orm-entity';

@Entity({
  name: 'sections',
  schema: 'public',
})
@Index('idx_sections_course_id', ['courseId'])
@Index('idx_sections_slug', ['slug'])
export class SectionOrmEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => CourseOrmEntity, (course) => course.sections)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;

  @OneToMany(() => LessonOrmEntity, (lesson) => lesson.section)
  lessons: LessonOrmEntity[];
}

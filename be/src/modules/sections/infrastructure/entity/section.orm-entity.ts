import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

@Entity({
  name: 'sections',
  schema: 'public',
})
@Index('idx_sections_course_id', ['courseId'])
@Index('idx_sections_slug', ['slug'])
export class SectionOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => CourseOrmEntity, (course) => course.sections)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;

  @OneToMany(() => LessonOrmEntity, (lesson) => lesson.section)
  lessons: LessonOrmEntity[];
}

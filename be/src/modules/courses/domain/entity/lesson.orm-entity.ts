import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { SectionOrmEntity } from './section.orm-entity';

@Entity({
  name: 'lessons',
  schema: 'public',
})
@Index('idx_lessons_section_id', ['sectionId'])
@Index('idx_lessons_slug', ['slug'])
export class LessonOrmEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'section_id', type: 'bigint' })
  sectionId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 255, default: 'video' })
  type: string;

  @Column({
    name: 'video_provider',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  videoProvider: string | null;

  @Column({
    name: 'video_source',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  videoSource: string | null;

  @Column({ type: 'integer', nullable: true })
  duration: number | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'smallint', default: 0 })
  status: number;

  @Column({ name: 'is_preview', type: 'boolean', default: false })
  isPreview: boolean;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => SectionOrmEntity, (section) => section.lessons)
  @JoinColumn({ name: 'section_id' })
  section: SectionOrmEntity;
}

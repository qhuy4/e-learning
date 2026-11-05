import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

@Entity('lesson_comments')
export class LessonCommentOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lesson_id', type: 'bigint' })
  lessonId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId: number | null;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => LessonOrmEntity)
  @JoinColumn({ name: 'lesson_id' })
  lesson: LessonOrmEntity;
}

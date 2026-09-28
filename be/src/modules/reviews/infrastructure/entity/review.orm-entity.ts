import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { ReviewImageOrmEntity } from './review-image.orm-entity';

@Entity({
  name: 'reviews',
  schema: 'public',
})
@Index('idx_reviews_course_id', ['courseId'])
@Index('idx_reviews_user_id', ['userId'])
export class ReviewOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: string;

  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId: string;

  @Column({
    name: 'course_id',
    type: 'bigint',
  })
  courseId: string;

  @Column({
    type: 'smallint',
  })
  rating: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment: string | null;

  @Column({
    type: 'smallint',
    default: 1,
  })
  status: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt: Date | null;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;

  @ManyToOne(() => UserOrmEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => CourseOrmEntity, { nullable: false })
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;

  @OneToMany(() => ReviewImageOrmEntity, (image) => image.review, {
    cascade: true,
  })
  images: ReviewImageOrmEntity[];
}

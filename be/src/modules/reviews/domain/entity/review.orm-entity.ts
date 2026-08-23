import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'reviews',
  schema: 'public',
})
@Index('idx_reviews_course_id', ['courseId'])
@Index('idx_reviews_user_id', ['userId'])
export class ReviewOrmEntity {
  @PrimaryColumn({
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
}

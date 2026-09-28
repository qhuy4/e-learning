import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReviewOrmEntity } from './review.orm-entity';

@Entity({
  name: 'review_images',
  schema: 'public',
})
export class ReviewImageOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: string;

  @Column({
    name: 'review_id',
    type: 'bigint',
  })
  reviewId: string;

  @Column({
    name: 'image_url',
    type: 'text',
  })
  imageUrl: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt: Date | null;

  @ManyToOne(() => ReviewOrmEntity, (review) => review.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review: ReviewOrmEntity;
}

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

@Entity({ name: 'wishlists', schema: 'public' })
export class WishlistOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'name', type: 'varchar', length: 100, default: 'Saved' })
  name: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}

@Entity({ name: 'wishlist_items', schema: 'public' })
export class WishlistItemOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'wishlist_id', type: 'bigint' })
  wishlistId: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @Column({ name: 'added_at', type: 'timestamp' })
  addedAt: Date;

  @Column({ name: 'note', type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @ManyToOne(() => WishlistOrmEntity)
  @JoinColumn({ name: 'wishlist_id' })
  wishlist: WishlistOrmEntity;

  @ManyToOne(() => CourseOrmEntity)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;
}

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'categories', schema: 'public' })
export class CategoryOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => CategoryOrmEntity, (cat) => cat.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: CategoryOrmEntity | null;

  @OneToMany(() => CategoryOrmEntity, (cat) => cat.parent)
  children: CategoryOrmEntity[];
}

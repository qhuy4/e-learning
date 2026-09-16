import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'achievements', schema: 'public' })
export class AchievementOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'icon', type: 'varchar', length: 255, nullable: true })
  icon: string | null;

  @Column({ name: 'category', type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ name: 'criteria', type: 'varchar', length: 50 })
  criteria: string;

  @Column({ name: 'threshold', type: 'int' })
  threshold: number;

  @Column({ name: 'reward', type: 'jsonb', nullable: true })
  reward: unknown | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}

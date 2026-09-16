import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { AchievementOrmEntity } from './achievement.orm-entity';

@Entity({ name: 'user_achievements', schema: 'public' })
@Unique(['userId', 'achievementId'])
export class UserAchievementOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'achievement_id', type: 'bigint' })
  achievementId: string;

  @Column({ name: 'earned_at', type: 'timestamp' })
  earnedAt: Date;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => AchievementOrmEntity)
  @JoinColumn({ name: 'achievement_id' })
  achievement: AchievementOrmEntity;
}

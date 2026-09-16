import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AchievementOrmEntity } from '@/modules/achievements/infrastructure/entity/achievement.orm-entity';
import { UserAchievementOrmEntity } from '@/modules/achievements/infrastructure/entity/user-achievement.orm-entity';
import { AchievementCriteria } from '@/modules/achievements/domain/enum/achievement-criteria.enum';
import { AwardAchievementCommand } from '@/modules/achievements/application/command/award-achievement.command';

@Injectable()
export class AchievementEvaluator {
  private readonly logger = new Logger(AchievementEvaluator.name);

  constructor(
    @InjectRepository(AchievementOrmEntity)
    private readonly achievementRepo: Repository<AchievementOrmEntity>,
    @InjectRepository(UserAchievementOrmEntity)
    private readonly userAchievementRepo: Repository<UserAchievementOrmEntity>,
    private readonly commandBus: CommandBus,
  ) {}

  async evaluate(userId: number, eventType: AchievementCriteria): Promise<void> {
    const achievements = await this.achievementRepo.find({
      where: { criteria: eventType, isActive: true },
    });

    if (achievements.length === 0) return;

    const count = await this.getCount(userId, eventType);

    for (const achievement of achievements) {
      if (count >= achievement.threshold) {
        const alreadyEarned = await this.userAchievementRepo.findOne({
          where: { userId: userId.toString(), achievementId: achievement.id },
        });

        if (!alreadyEarned) {
          this.logger.log(
            `Awarding achievement "${achievement.name}" to user ${userId} (count=${count}, threshold=${achievement.threshold})`,
          );
          await this.commandBus.execute(
            new AwardAchievementCommand(userId, Number(achievement.id)),
          );
        }
      }
    }
  }

  private async getCount(userId: number, eventType: AchievementCriteria): Promise<number> {
    switch (eventType) {
      case AchievementCriteria.LESSONS_COMPLETED: {
        const result = await this.userAchievementRepo.manager.query(
          `SELECT COUNT(*)::int AS count FROM lesson_progress WHERE user_id = $1 AND is_completed = true`,
          [userId],
        );
        return result[0]?.count ?? 0;
      }
      case AchievementCriteria.COURSES_COMPLETED: {
        const result = await this.userAchievementRepo.manager.query(
          `SELECT COUNT(*)::int AS count FROM enrollments WHERE user_id = $1 AND status = 2`,
          [userId],
        );
        return result[0]?.count ?? 0;
      }
      case AchievementCriteria.QUIZZES_COMPLETED: {
        const result = await this.userAchievementRepo.manager.query(
          `SELECT COUNT(*)::int AS count FROM lesson_progress WHERE user_id = $1 AND is_completed = true AND quiz_passed = true`,
          [userId],
        );
        return result[0]?.count ?? 0;
      }
      case AchievementCriteria.LEARNING_HOURS: {
        const result = await this.userAchievementRepo.manager.query(
          `SELECT COALESCE(SUM(watch_seconds), 0) / 3600.0 AS hours FROM lesson_progress WHERE user_id = $1`,
          [userId],
        );
        return Math.floor(result[0]?.hours ?? 0);
      }
      case AchievementCriteria.PERFECT_QUIZ_SCORE: {
        const result = await this.userAchievementRepo.manager.query(
          `SELECT COUNT(*)::int AS count FROM lesson_progress WHERE user_id = $1 AND is_completed = true AND quiz_passed = true AND quiz_score = 100`,
          [userId],
        );
        return result[0]?.count ?? 0;
      }
      case AchievementCriteria.HIGH_QUIZ_SCORES: {
        const result = await this.userAchievementRepo.manager.query(
          `SELECT COUNT(*)::int AS count FROM lesson_progress WHERE user_id = $1 AND is_completed = true AND quiz_passed = true AND quiz_score >= 90`,
          [userId],
        );
        return result[0]?.count ?? 0;
      }
      case AchievementCriteria.STREAK_DAYS: {
        const result = await this.userAchievementRepo.manager.query(
          `SELECT COUNT(DISTINCT DATE(earned_at))::int AS count FROM user_achievements WHERE user_id = $1 AND earned_at >= NOW() - INTERVAL '30 days'`,
          [userId],
        );
        return result[0]?.count ?? 0;
      }
      case AchievementCriteria.ACHIEVEMENTS_EARNED: {
        const result = await this.userAchievementRepo.manager.query(
          `SELECT COUNT(*)::int AS count FROM user_achievements WHERE user_id = $1`,
          [userId],
        );
        return result[0]?.count ?? 0;
      }
      default:
        return 0;
    }
  }
}

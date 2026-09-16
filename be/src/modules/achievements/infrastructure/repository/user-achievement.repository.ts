import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAchievementOrmEntity } from '@/modules/achievements/infrastructure/entity/user-achievement.orm-entity';

@Injectable()
export class UserAchievementRepository {
  constructor(
    @InjectRepository(UserAchievementOrmEntity)
    private readonly repository: Repository<UserAchievementOrmEntity>,
  ) {}

  async findByUser(userId: number) {
    const entities = await this.repository.find({
      where: { userId: userId.toString() },
      relations: { achievement: true },
      order: { earnedAt: 'DESC' },
    });

    return entities.map((e) => ({
      id: Number(e.id),
      userId: Number(e.userId),
      achievementId: Number(e.achievementId),
      earnedAt: e.earnedAt,
      createdAt: e.createdAt,
      achievement: e.achievement
        ? {
            id: Number(e.achievement.id),
            name: e.achievement.name,
            description: e.achievement.description,
            icon: e.achievement.icon,
            criteria: e.achievement.criteria,
            threshold: e.achievement.threshold,
            reward: e.achievement.reward,
          }
        : undefined,
    }));
  }

  async findByAchievement(achievementId: number) {
    const entities = await this.repository.find({
      where: { achievementId: achievementId.toString() },
      relations: { user: true },
      order: { earnedAt: 'DESC' },
    });

    return entities.map((e) => ({
      id: Number(e.id),
      userId: Number(e.userId),
      achievementId: Number(e.achievementId),
      userName: e.user?.name ?? '—',
      userEmail: e.user?.email ?? '—',
      earnedAt: e.earnedAt,
      createdAt: e.createdAt,
    }));
  }

  async findByAchievementPaginated(
    achievementId: number,
    options: { page: number; limit: number; keyword?: string },
  ) {
    const { page, limit, keyword } = options;

    const query = this.repository
      .createQueryBuilder('ua')
      .leftJoinAndSelect('ua.user', 'user')
      .where('ua.achievement_id = :achievementId', { achievementId: achievementId.toString() });

    if (keyword) {
      query.andWhere('(user.name ILIKE :keyword OR user.email ILIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    query.orderBy('ua.earned_at', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((e) => ({
      id: Number(e.id),
      userId: Number(e.userId),
      achievementId: Number(e.achievementId),
      userName: e.user?.name ?? '—',
      userEmail: e.user?.email ?? '—',
      earnedAt: e.earnedAt,
      createdAt: e.createdAt,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async existsByUserAndAchievement(userId: number, achievementId: number) {
    const count = await this.repository.count({
      where: { userId: userId.toString(), achievementId: achievementId.toString() },
    });
    return count > 0;
  }

  async countByUser(userId: number) {
    return this.repository.count({ where: { userId: userId.toString() } });
  }

  async countByAchievement(achievementId: number) {
    return this.repository.count({ where: { achievementId: achievementId.toString() } });
  }

  async create(userId: number, achievementId: number) {
    const entity = this.repository.create({
      userId: userId.toString(),
      achievementId: achievementId.toString(),
      earnedAt: new Date(),
    });
    const saved = await this.repository.save(entity);
    return {
      id: Number(saved.id),
      userId: Number(saved.userId),
      achievementId: Number(saved.achievementId),
      earnedAt: saved.earnedAt,
      createdAt: saved.createdAt,
    };
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAchievementsQuery } from '@/modules/achievements/application/query/get-achievements.query';
import { AchievementRepository } from '@/modules/achievements/infrastructure/repository/achievement.repository';

@QueryHandler(GetAchievementsQuery)
export class GetAchievementsHandler implements IQueryHandler<GetAchievementsQuery> {
  constructor(private readonly achievementRepository: AchievementRepository) {}

  async execute(query: GetAchievementsQuery) {
    return this.achievementRepository.findAll({
      page: query.page,
      limit: query.limit,
      keyword: query.keyword,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}

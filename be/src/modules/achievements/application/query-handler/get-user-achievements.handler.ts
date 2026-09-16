import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserAchievementsQuery } from '@/modules/achievements/application/query/get-user-achievements.query';
import { UserAchievementRepository } from '@/modules/achievements/infrastructure/repository/user-achievement.repository';

@QueryHandler(GetUserAchievementsQuery)
export class GetUserAchievementsHandler implements IQueryHandler<GetUserAchievementsQuery> {
  constructor(private readonly userAchievementRepository: UserAchievementRepository) {}

  async execute(query: GetUserAchievementsQuery) {
    const achievements = await this.userAchievementRepository.findByUser(query.userId);
    return { data: achievements };
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetAchievementsQuery } from '@/modules/achievements/application/query/get-achievements.query';
import { AchievementRepository } from '@/modules/achievements/infrastructure/repository/achievement.repository';
import { FILE_STORAGE, FileStorage } from '@/common/storage/domain/interface/file-storage.interface';

const DOWNLOAD_EXPIRES_IN = 600;

@QueryHandler(GetAchievementsQuery)
export class GetAchievementsHandler implements IQueryHandler<GetAchievementsQuery> {
  private readonly logger = new Logger(GetAchievementsHandler.name);

  constructor(
    private readonly achievementRepository: AchievementRepository,
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
  ) {}

  async execute(query: GetAchievementsQuery) {
    const result = await this.achievementRepository.findAll({
      page: query.page,
      limit: query.limit,
      keyword: query.keyword,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      criteria: query.criteria,
      isActive: query.isActive,
    });

    for (const item of result.data) {
      if (item.icon && !item.icon.startsWith('http')) {
        try {
          item.icon = await this.fileStorage.createDownloadUrl({
            key: item.icon,
            expiresIn: DOWNLOAD_EXPIRES_IN,
          });
        } catch {
          item.icon = null;
        }
      }
    }

    return result;
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetUserAchievementsQuery } from '@/modules/achievements/application/query/get-user-achievements.query';
import { UserAchievementRepository } from '@/modules/achievements/infrastructure/repository/user-achievement.repository';
import { FILE_STORAGE, FileStorage } from '@/common/storage/domain/interface/file-storage.interface';

const DOWNLOAD_EXPIRES_IN = 600;

@QueryHandler(GetUserAchievementsQuery)
export class GetUserAchievementsHandler implements IQueryHandler<GetUserAchievementsQuery> {
  private readonly logger = new Logger(GetUserAchievementsHandler.name);

  constructor(
    private readonly userAchievementRepository: UserAchievementRepository,
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
  ) {}

  async execute(query: GetUserAchievementsQuery) {
    const achievements = await this.userAchievementRepository.findByUser(query.userId);

    for (const item of achievements) {
      const icon = item.achievement?.icon;
      if (icon && !icon.startsWith('http')) {
        try {
          item.achievement!.icon = await this.fileStorage.createDownloadUrl({
            key: icon,
            expiresIn: DOWNLOAD_EXPIRES_IN,
          });
        } catch {
          item.achievement!.icon = null;
        }
      }
    }

    return { data: achievements };
  }
}

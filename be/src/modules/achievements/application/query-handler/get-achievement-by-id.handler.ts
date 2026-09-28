import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject, Logger } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { GetAchievementByIdQuery } from '@/modules/achievements/application/query/get-achievement-by-id.query';
import { AchievementRepository } from '@/modules/achievements/infrastructure/repository/achievement.repository';
import { FILE_STORAGE, FileStorage } from '@/common/storage/domain/interface/file-storage.interface';

const DOWNLOAD_EXPIRES_IN = 600;

@QueryHandler(GetAchievementByIdQuery)
export class GetAchievementByIdHandler implements IQueryHandler<GetAchievementByIdQuery> {
  private readonly logger = new Logger(GetAchievementByIdHandler.name);

  constructor(
    private readonly achievementRepository: AchievementRepository,
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
  ) {}

  async execute(query: GetAchievementByIdQuery) {
    const achievement = await this.achievementRepository.findById(query.id);
    if (!achievement) {
      throw new AppException(ErrorCode.ACHIEVEMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (achievement.icon && !achievement.icon.startsWith('http')) {
      try {
        achievement.icon = await this.fileStorage.createDownloadUrl({
          key: achievement.icon,
          expiresIn: DOWNLOAD_EXPIRES_IN,
        });
      } catch (err) {
        this.logger.warn(`Failed to resolve icon URL: ${(err as Error).message}`);
        achievement.icon = null;
      }
    }

    return achievement;
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { GetAchievementByIdQuery } from '@/modules/achievements/application/query/get-achievement-by-id.query';
import { AchievementRepository } from '@/modules/achievements/infrastructure/repository/achievement.repository';

@QueryHandler(GetAchievementByIdQuery)
export class GetAchievementByIdHandler implements IQueryHandler<GetAchievementByIdQuery> {
  constructor(private readonly achievementRepository: AchievementRepository) {}

  async execute(query: GetAchievementByIdQuery) {
    const achievement = await this.achievementRepository.findById(query.id);
    if (!achievement) {
      throw new AppException(ErrorCode.ACHIEVEMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return achievement;
  }
}

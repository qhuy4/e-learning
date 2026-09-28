import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AwardAchievementCommand } from '@/modules/achievements/application/command/award-achievement.command';
import { AchievementRepository } from '@/modules/achievements/infrastructure/repository/achievement.repository';
import { UserAchievementRepository } from '@/modules/achievements/infrastructure/repository/user-achievement.repository';

@CommandHandler(AwardAchievementCommand)
export class AwardAchievementHandler implements ICommandHandler<AwardAchievementCommand> {
  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly userAchievementRepository: UserAchievementRepository,
  ) {}

  async execute(command: AwardAchievementCommand) {
    const achievement = await this.achievementRepository.findById(command.achievementId);
    if (!achievement) {
      throw new AppException(ErrorCode.ACHIEVEMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const alreadyEarned = await this.userAchievementRepository.existsByUserAndAchievement(
      command.userId,
      command.achievementId,
    );
    if (alreadyEarned) {
      return { data: null };
    }

    const userAchievement = await this.userAchievementRepository.create(
      command.userId,
      command.achievementId,
    );

    return { data: userAchievement };
  }
}

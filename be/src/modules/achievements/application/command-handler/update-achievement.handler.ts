import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { UpdateAchievementCommand } from '@/modules/achievements/application/command/update-achievement.command';
import { AchievementRepository } from '@/modules/achievements/infrastructure/repository/achievement.repository';

@CommandHandler(UpdateAchievementCommand)
export class UpdateAchievementHandler implements ICommandHandler<UpdateAchievementCommand> {
  constructor(private readonly achievementRepository: AchievementRepository) {}

  async execute(command: UpdateAchievementCommand) {
    const existing = await this.achievementRepository.findById(command.id);
    if (!existing) {
      throw new AppException(ErrorCode.ACHIEVEMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updated = await this.achievementRepository.update(command.id, {
      name: command.name,
      description: command.description,
      icon: command.icon,
      criteria: command.criteria,
      threshold: command.threshold,
      reward: command.reward as any,
      isActive: command.isActive,
    });

    return { data: updated };
  }
}

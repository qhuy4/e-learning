import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CreateAchievementCommand } from '@/modules/achievements/application/command/create-achievement.command';
import { AchievementRepository } from '@/modules/achievements/infrastructure/repository/achievement.repository';

@CommandHandler(CreateAchievementCommand)
export class CreateAchievementHandler implements ICommandHandler<CreateAchievementCommand> {
  constructor(private readonly achievementRepository: AchievementRepository) {}

  async execute(command: CreateAchievementCommand) {
    const existing = await this.achievementRepository.findByName(command.name);
    if (existing) {
      throw new AppException(
        ErrorCode.ACHIEVEMENT_NAME_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    const saved = await this.achievementRepository.create({
      name: command.name,
      description: command.description,
      icon: command.icon,
      criteria: command.criteria,
      threshold: command.threshold,
      reward: command.reward,
    });

    return { data: saved };
  }
}

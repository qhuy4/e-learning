import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { DeleteAchievementCommand } from '@/modules/achievements/application/command/delete-achievement.command';
import { AchievementRepository } from '@/modules/achievements/infrastructure/repository/achievement.repository';

@CommandHandler(DeleteAchievementCommand)
export class DeleteAchievementHandler implements ICommandHandler<DeleteAchievementCommand> {
  constructor(private readonly achievementRepository: AchievementRepository) {}

  async execute(command: DeleteAchievementCommand) {
    const existing = await this.achievementRepository.findById(command.id);
    if (!existing) {
      throw new AppException(ErrorCode.ACHIEVEMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.achievementRepository.delete(command.id);
    return { success: true };
  }
}

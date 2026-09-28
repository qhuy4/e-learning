import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DetachDictationCommand } from '../command/detach-dictation.command';
import { Inject } from '@nestjs/common';
import { ILessonDictationRepository, LESSON_DICTATION_REPOSITORY } from '../../domain/repository/lesson-dictation.repository';

@CommandHandler(DetachDictationCommand)
export class DetachDictationHandler implements ICommandHandler<DetachDictationCommand> {
  constructor(@Inject(LESSON_DICTATION_REPOSITORY) private lessonDictRepo: ILessonDictationRepository) {}
  async execute(command: DetachDictationCommand) {
    await this.lessonDictRepo.delete(Number(command.lessonId), Number(command.dictationId));
    return { success: true };
  }
}

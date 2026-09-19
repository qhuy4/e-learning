import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttachDictationCommand } from '../command/attach-dictation.command';
import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ILessonDictationRepository, LESSON_DICTATION_REPOSITORY } from '../../domain/repository/lesson-dictation.repository';
import { IDictationRepository, DICTATION_REPOSITORY } from '../../domain/repository/dictation.repository';

@CommandHandler(AttachDictationCommand)
export class AttachDictationHandler implements ICommandHandler<AttachDictationCommand> {
  constructor(
    @Inject(LESSON_DICTATION_REPOSITORY) private lessonDictRepo: ILessonDictationRepository,
    @Inject(DICTATION_REPOSITORY) private dictRepo: IDictationRepository
  ) {}
  async execute(command: AttachDictationCommand) {
    const dict = await this.dictRepo.findById(Number(command.dictationId));
    if (!dict) throw new NotFoundException();
    if (dict.createdBy !== command.userId) throw new UnauthorizedException();
    await this.lessonDictRepo.create(Number(command.lessonId), Number(command.dictationId));
    return { success: true };
  }
}

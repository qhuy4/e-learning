import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { DeleteLessonNoteCommand } from '../command/delete-lesson-note.command';
import {
  ILessonNoteRepository,
  LESSON_NOTE_REPOSITORY,
} from '../../domain/repository/lesson-note.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(DeleteLessonNoteCommand)
export class DeleteLessonNoteHandler
  implements ICommandHandler<DeleteLessonNoteCommand>
{
  constructor(
    @Inject(LESSON_NOTE_REPOSITORY)
    private readonly lessonNoteRepository: ILessonNoteRepository,
  ) {}

  async execute(command: DeleteLessonNoteCommand): Promise<{ success: true }> {
    // Chỉ xóa được ghi chú của chính mình.
    const existing = await this.lessonNoteRepository.findByIdForUser(
      command.noteId,
      command.userId,
    );
    if (!existing) {
      throw new AppException(
        ErrorCode.LESSON_NOTE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.lessonNoteRepository.delete(command.noteId);
    return { success: true };
  }
}

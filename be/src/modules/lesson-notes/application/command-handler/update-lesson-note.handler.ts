import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { UpdateLessonNoteCommand } from '../command/update-lesson-note.command';
import {
  ILessonNoteRepository,
  LESSON_NOTE_REPOSITORY,
} from '../../domain/repository/lesson-note.repository';
import { LessonNote } from '../../domain/entity/lesson-note.entity';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(UpdateLessonNoteCommand)
export class UpdateLessonNoteHandler
  implements ICommandHandler<UpdateLessonNoteCommand>
{
  constructor(
    @Inject(LESSON_NOTE_REPOSITORY)
    private readonly lessonNoteRepository: ILessonNoteRepository,
  ) {}

  async execute(command: UpdateLessonNoteCommand): Promise<LessonNote> {
    // Chỉ sửa được ghi chú của chính mình.
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

    existing.updateContent(command.content);
    return this.lessonNoteRepository.update(existing);
  }
}

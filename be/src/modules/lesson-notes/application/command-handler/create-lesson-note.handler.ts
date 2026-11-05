import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateLessonNoteCommand } from '../command/create-lesson-note.command';
import {
  ILessonNoteRepository,
  LESSON_NOTE_REPOSITORY,
} from '../../domain/repository/lesson-note.repository';
import { LessonNote } from '../../domain/entity/lesson-note.entity';

@CommandHandler(CreateLessonNoteCommand)
export class CreateLessonNoteHandler
  implements ICommandHandler<CreateLessonNoteCommand>
{
  constructor(
    @Inject(LESSON_NOTE_REPOSITORY)
    private readonly lessonNoteRepository: ILessonNoteRepository,
  ) {}

  async execute(command: CreateLessonNoteCommand): Promise<LessonNote> {
    const note = new LessonNote(
      0,
      command.userId,
      command.lessonId,
      command.noteTimeSeconds,
      command.content,
    );

    return this.lessonNoteRepository.create(note);
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetLessonNotesQuery } from '../query/get-lesson-notes.query';
import {
  ILessonNoteRepository,
  LESSON_NOTE_REPOSITORY,
} from '../../domain/repository/lesson-note.repository';
import { LessonNote } from '../../domain/entity/lesson-note.entity';

@QueryHandler(GetLessonNotesQuery)
export class GetLessonNotesHandler
  implements IQueryHandler<GetLessonNotesQuery>
{
  constructor(
    @Inject(LESSON_NOTE_REPOSITORY)
    private readonly lessonNoteRepository: ILessonNoteRepository,
  ) {}

  async execute(query: GetLessonNotesQuery): Promise<LessonNote[]> {
    return this.lessonNoteRepository.findByUserAndLesson(
      query.userId,
      query.lessonId,
    );
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetLessonProgressQuery } from '../query/get-lesson-progress.query';

import { ILessonProgressRepository } from '../../domain/repository/lesson-progress.repository';

import { LESSON_PROGRESS_REPOSITORY } from '../../domain/repository/lesson-progress.repository';

@QueryHandler(GetLessonProgressQuery)
export class GetLessonProgressHandler implements IQueryHandler<GetLessonProgressQuery> {
  constructor(
    @Inject(LESSON_PROGRESS_REPOSITORY)
    private readonly lessonProgressRepository: ILessonProgressRepository,
  ) {}

  async execute(query: GetLessonProgressQuery) {
    return this.lessonProgressRepository.findByUserAndLesson(
      query.userId,
      query.lessonId,
    );
  }
}

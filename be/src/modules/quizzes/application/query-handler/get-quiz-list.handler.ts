import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetQuizListQuery } from '../query/get-quiz-list.query';
import { Inject } from '@nestjs/common';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';

@QueryHandler(GetQuizListQuery)
export class GetQuizListHandler implements IQueryHandler<GetQuizListQuery> {
  constructor(@Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository) {}
  async execute(query: GetQuizListQuery) {
    return this.quizRepo.findAll();
  }
}

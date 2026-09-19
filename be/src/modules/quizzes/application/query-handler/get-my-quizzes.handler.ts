import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMyQuizzesQuery } from '../query/get-my-quizzes.query';
import { Inject } from '@nestjs/common';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';

@QueryHandler(GetMyQuizzesQuery)
export class GetMyQuizzesHandler implements IQueryHandler<GetMyQuizzesQuery> {
  constructor(@Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository) {}
  async execute(query: GetMyQuizzesQuery) {
    return this.quizRepo.findByCreator(Number(query.userId));
  }
}

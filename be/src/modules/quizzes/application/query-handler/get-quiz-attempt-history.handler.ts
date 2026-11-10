import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQuizAttemptHistoryQuery } from '../query/get-quiz-attempt-history.query';
import { IQuizAttemptRepository, QUIZ_ATTEMPT_REPOSITORY } from '../../domain/repository/quiz-attempt.repository';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';

@QueryHandler(GetQuizAttemptHistoryQuery)
export class GetQuizAttemptHistoryHandler
  implements IQueryHandler<GetQuizAttemptHistoryQuery>
{
  constructor(
    @Inject(QUIZ_ATTEMPT_REPOSITORY) private readonly attempts: IQuizAttemptRepository,
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  async execute(query: GetQuizAttemptHistoryQuery) {
    const quiz = await this.quizzes.findById(query.quizId);
    if (!quiz) return [];

    const attempts = await this.attempts.findSubmittedByQuizAndUser(
      query.quizId,
      query.userId,
    );
    return attempts.map((attempt) => ({
      id: attempt.id,
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      submittedAt: attempt.submittedAt,
      passed: quiz.passingScore <= 0 || attempt.score >= quiz.passingScore,
    }));
  }
}

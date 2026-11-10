import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQuizAttemptReviewQuery } from '../query/get-quiz-attempt-review.query';
import { IQuizAttemptRepository, QUIZ_ATTEMPT_REPOSITORY } from '../../domain/repository/quiz-attempt.repository';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';
import { IQuizAnswerRepository, QUIZ_ANSWER_REPOSITORY } from '../../domain/repository/quiz-answer.repository';
import { IQuizQuestionRepository, QUIZ_QUESTION_REPOSITORY } from '../../domain/repository/quiz-question.repository';
import { IQuizOptionRepository, QUIZ_OPTION_REPOSITORY } from '../../domain/repository/quiz-option.repository';

@QueryHandler(GetQuizAttemptReviewQuery)
export class GetQuizAttemptReviewHandler
  implements IQueryHandler<GetQuizAttemptReviewQuery>
{
  constructor(
    @Inject(QUIZ_ATTEMPT_REPOSITORY) private readonly attempts: IQuizAttemptRepository,
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
    @Inject(QUIZ_ANSWER_REPOSITORY) private readonly answers: IQuizAnswerRepository,
    @Inject(QUIZ_QUESTION_REPOSITORY) private readonly questions: IQuizQuestionRepository,
    @Inject(QUIZ_OPTION_REPOSITORY) private readonly options: IQuizOptionRepository,
  ) {}

  async execute(query: GetQuizAttemptReviewQuery) {
    const attempt = await this.attempts.findById(query.attemptId);
    if (!attempt || attempt.userId !== query.userId) {
      throw new NotFoundException('Không tìm thấy lần làm bài.');
    }
    const quiz = await this.quizzes.findById(attempt.quizId);
    if (!quiz) throw new NotFoundException('Không tìm thấy bài kiểm tra.');
    if (!quiz.showAnswerAfterSubmit) {
      throw new ForbiddenException('Giảng viên chưa bật xem đáp án sau khi nộp bài.');
    }

    const [answers, questions] = await Promise.all([
      this.answers.findByAttemptId(query.attemptId),
      this.questions.findByQuizId(attempt.quizId),
    ]);
    const options = await this.options.findByQuestionIds(questions.map((question) => question.id!));

    return {
      attemptId: attempt.id,
      questions: questions.map((question) => {
        const answer = answers.find((item) => item.questionId === question.id);
        const selectedOption = options.find((option) => option.id === answer?.selectedOptionId);
        const correctOption = options.find((option) => option.questionId === question.id && option.isCorrect);
        return {
          id: question.id,
          question: question.question,
          isCorrect: answer?.isCorrect ?? false,
          earnedPoints: answer?.earnedPoints ?? 0,
          selectedAnswer: selectedOption?.content ?? answer?.answerText ?? null,
          correctAnswer: correctOption?.content ?? null,
        };
      }),
    };
  }
}

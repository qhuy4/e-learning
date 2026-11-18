import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetQuizByIdQuery } from '../query/get-quiz-by-id.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';
import { IQuizQuestionRepository, QUIZ_QUESTION_REPOSITORY } from '../../domain/repository/quiz-question.repository';
import { IQuizOptionRepository, QUIZ_OPTION_REPOSITORY } from '../../domain/repository/quiz-option.repository';
import { QuizOption } from '../../domain/entity/quiz-option.entity';

@QueryHandler(GetQuizByIdQuery)
export class GetQuizByIdHandler implements IQueryHandler<GetQuizByIdQuery> {
  constructor(
    @Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository,
    @Inject(QUIZ_QUESTION_REPOSITORY) private questionRepo: IQuizQuestionRepository,
    @Inject(QUIZ_OPTION_REPOSITORY) private optionRepo: IQuizOptionRepository,
  ) {}
  async execute(query: GetQuizByIdQuery) {
    const quiz = await this.quizRepo.findById(Number(query.id));
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questions = await this.questionRepo.findByQuizId(quiz.id!);
    let options: QuizOption[] = [];
    if (questions.length > 0) {
      options = await this.optionRepo.findByQuestionIds(questions.map(q => q.id!));
    }

    // Map questions with options
    const mappedQuestions = questions.map(q => ({
      ...q,
      options: options.filter(o => o.questionId === q.id)
    }));

    return {
      ...quiz,
      questions: mappedQuestions
    };
  }
}

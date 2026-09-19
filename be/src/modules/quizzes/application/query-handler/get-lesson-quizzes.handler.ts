import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLessonQuizzesQuery } from '../query/get-lesson-quizzes.query';
import { Inject } from '@nestjs/common';
import { ILessonQuizRepository, LESSON_QUIZ_REPOSITORY } from '../../domain/repository/lesson-quiz.repository';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';
import { IQuizQuestionRepository, QUIZ_QUESTION_REPOSITORY } from '../../domain/repository/quiz-question.repository';

@QueryHandler(GetLessonQuizzesQuery)
export class GetLessonQuizzesHandler implements IQueryHandler<GetLessonQuizzesQuery> {
  constructor(
    @Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository,
    @Inject(LESSON_QUIZ_REPOSITORY) private lessonQuizRepo: ILessonQuizRepository,
    @Inject(QUIZ_QUESTION_REPOSITORY) private questionRepo: IQuizQuestionRepository,
  ) {}
  async execute(query: GetLessonQuizzesQuery) {
    const mappings = await this.lessonQuizRepo.findByLessonId(Number(query.lessonId));
    if (!mappings || mappings.length === 0) return [];
    
    // Fetch all quizzes by IDs
    const quizzes: any[] = [];
    for (const m of mappings) {
      const quiz = await this.quizRepo.findById(Number(m.quizId));
      if (quiz) {
        const questions = await this.questionRepo.findByQuizId(quiz.id!);
        quizzes.push({
          ...quiz,
          questions
        });
      }
    }
    return quizzes;
  }
}

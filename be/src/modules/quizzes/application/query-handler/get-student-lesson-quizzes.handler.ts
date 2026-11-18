import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GetStudentLessonQuizzesQuery,
  StudentLessonQuizItem,
} from '../query/get-student-lesson-quizzes.query';
import { ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILessonQuizRepository, LESSON_QUIZ_REPOSITORY } from '../../domain/repository/lesson-quiz.repository';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';
import { IQuizQuestionRepository, QUIZ_QUESTION_REPOSITORY } from '../../domain/repository/quiz-question.repository';
import { IQuizOptionRepository, QUIZ_OPTION_REPOSITORY } from '../../domain/repository/quiz-option.repository';
import { IQuizAttemptRepository, QUIZ_ATTEMPT_REPOSITORY } from '../../domain/repository/quiz-attempt.repository';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { ENROLLMENT_REPOSITORY, IEnrollmentRepository } from '@/modules/enrollments/domain/repository/enrollment.repository';

/**
 * Danh sách quiz của 1 lesson cho HỌC VIÊN.
 * KHÔNG trả về isCorrect / explanation để tránh lộ đáp án.
 */
@QueryHandler(GetStudentLessonQuizzesQuery)
export class GetStudentLessonQuizzesHandler implements IQueryHandler<GetStudentLessonQuizzesQuery> {
  constructor(
    @Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository,
    @Inject(LESSON_QUIZ_REPOSITORY) private lessonQuizRepo: ILessonQuizRepository,
    @Inject(QUIZ_QUESTION_REPOSITORY) private questionRepo: IQuizQuestionRepository,
    @Inject(QUIZ_OPTION_REPOSITORY) private optionRepo: IQuizOptionRepository,
    @Inject(QUIZ_ATTEMPT_REPOSITORY) private attemptRepo: IQuizAttemptRepository,
    @Inject(ENROLLMENT_REPOSITORY) private enrollmentRepo: IEnrollmentRepository,
    @InjectRepository(LessonOrmEntity) private lessonRepo: Repository<LessonOrmEntity>,
    @InjectRepository(SectionOrmEntity) private sectionRepo: Repository<SectionOrmEntity>,
  ) {}

  async execute(query: GetStudentLessonQuizzesQuery) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: String(query.lessonId) },
    });
    const section = lesson
      ? await this.sectionRepo.findOne({ where: { id: String(lesson.sectionId) } })
      : null;
    const isEnrolled = section
      ? await this.enrollmentRepo.existsActiveByUserAndCourse(
          query.userId,
          Number(section.courseId),
        )
      : false;
    if (!isEnrolled) {
      throw new ForbiddenException('Bạn cần đăng ký khóa học để xem và làm bài kiểm tra.');
    }

    const mappings = await this.lessonQuizRepo.findByLessonId(Number(query.lessonId));
    if (!mappings || mappings.length === 0) return [];

    const quizzes: StudentLessonQuizItem[] = [];
    for (const m of mappings) {
      const quiz = await this.quizRepo.findById(Number(m.quizId));
      if (!quiz) continue;

      const questions = await this.questionRepo.findByQuizId(quiz.id!);
      const options = questions.length
        ? await this.optionRepo.findByQuestionIds(questions.map((q) => q.id!))
        : [];
      const attemptsUsed = await this.attemptRepo.countByQuizAndUser(quiz.id!, query.userId);
      const latestAttempt = await this.attemptRepo.findLatestSubmittedByQuizAndUser(
        quiz.id!,
        query.userId,
      );

      quizzes.push({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        showAnswerAfterSubmit: quiz.showAnswerAfterSubmit,
        shuffleQuestions: quiz.shuffleQuestions,
        shuffleOptions: quiz.shuffleOptions,
        attemptsUsed,
        latestAttempt: latestAttempt
          ? {
              score: latestAttempt.score,
              correctCount: latestAttempt.correctCount,
              totalQuestions: latestAttempt.totalQuestions,
              passed:
                quiz.passingScore <= 0 || latestAttempt.score >= quiz.passingScore,
            }
          : null,
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          audioUrl: q.audioUrl,
          imageUrl: q.imageUrl,
          points: q.points,
          position: q.position,
          options: options
            .filter((o) => o.questionId === q.id)
            .map((o) => ({ id: o.id, content: o.content, position: o.position })),
        })),
      });
    }
    return quizzes;
  }
}

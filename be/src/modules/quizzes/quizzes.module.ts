import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { QuizOrmEntity } from './infrastructure/entity/quiz.orm-entity';
import { LessonQuizOrmEntity } from './infrastructure/entity/lesson-quiz.orm-entity';
import { QuizQuestionOrmEntity } from './infrastructure/entity/quiz-question.orm-entity';
import { QuizOptionOrmEntity } from './infrastructure/entity/quiz-option.orm-entity';
import { QuizAttemptOrmEntity } from './infrastructure/entity/quiz-attempt.orm-entity';
import { QuizAnswerOrmEntity } from './infrastructure/entity/quiz-answer.orm-entity';

import { AdminQuizController } from './presentation/controllers/admin-quiz.controller';
import { TeacherQuizController } from './presentation/controllers/teacher-quiz.controller';
import { StudentQuizController } from './presentation/controllers/student-quiz.controller';

import { CreateQuizHandler } from './application/command-handler/create-quiz.handler';
import { UpdateQuizHandler } from './application/command-handler/update-quiz.handler';
import { DeleteQuizHandler } from './application/command-handler/delete-quiz.handler';
import { AttachQuizToLessonHandler } from './application/command-handler/attach-quiz-to-lesson.handler';
import { DetachQuizFromLessonHandler } from './application/command-handler/detach-quiz-from-lesson.handler';
import { StartQuizHandler } from './application/command-handler/start-quiz.handler';
import { SubmitQuizHandler } from './application/command-handler/submit-quiz.handler';

import { GetQuizByIdHandler } from './application/query-handler/get-quiz-by-id.handler';
import { GetQuizListHandler } from './application/query-handler/get-quiz-list.handler';
import { GetMyQuizzesHandler } from './application/query-handler/get-my-quizzes.handler';
import { GetLessonQuizzesHandler } from './application/query-handler/get-lesson-quizzes.handler';

import { QuizRepository } from './infrastructure/repository/quiz.repository';
import { QUIZ_REPOSITORY } from './domain/repository/quiz.repository';
import { QuizAttemptRepository } from './infrastructure/repository/quiz-attempt.repository';
import { QUIZ_ATTEMPT_REPOSITORY } from './domain/repository/quiz-attempt.repository';
import { LessonQuizRepository } from './infrastructure/repository/lesson-quiz.repository';
import { LESSON_QUIZ_REPOSITORY } from './domain/repository/lesson-quiz.repository';
import { QuizQuestionRepository } from './infrastructure/repository/quiz-question.repository';
import { QUIZ_QUESTION_REPOSITORY } from './domain/repository/quiz-question.repository';
import { QuizOptionRepository } from './infrastructure/repository/quiz-option.repository';
import { QUIZ_OPTION_REPOSITORY } from './domain/repository/quiz-option.repository';
import { QuizAnswerRepository } from './infrastructure/repository/quiz-answer.repository';
import { QUIZ_ANSWER_REPOSITORY } from './domain/repository/quiz-answer.repository';

const ormEntities = [
  QuizOrmEntity,
  LessonQuizOrmEntity,
  QuizQuestionOrmEntity,
  QuizOptionOrmEntity,
  QuizAttemptOrmEntity,
  QuizAnswerOrmEntity,
];

const commandHandlers = [
  CreateQuizHandler,
  UpdateQuizHandler,
  DeleteQuizHandler,
  AttachQuizToLessonHandler,
  DetachQuizFromLessonHandler,
  StartQuizHandler,
  SubmitQuizHandler,
];

const queryHandlers = [
  GetQuizByIdHandler,
  GetQuizListHandler,
  GetMyQuizzesHandler,
  GetLessonQuizzesHandler,
];

const repositories = [
  { provide: QUIZ_REPOSITORY, useClass: QuizRepository },
  { provide: QUIZ_ATTEMPT_REPOSITORY, useClass: QuizAttemptRepository },
  { provide: LESSON_QUIZ_REPOSITORY, useClass: LessonQuizRepository },
  { provide: QUIZ_QUESTION_REPOSITORY, useClass: QuizQuestionRepository },
  { provide: QUIZ_OPTION_REPOSITORY, useClass: QuizOptionRepository },
  { provide: QUIZ_ANSWER_REPOSITORY, useClass: QuizAnswerRepository },
];

@Module({
  imports: [TypeOrmModule.forFeature(ormEntities), CqrsModule],
  controllers: [AdminQuizController, TeacherQuizController, StudentQuizController],
  providers: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class QuizzesModule {}

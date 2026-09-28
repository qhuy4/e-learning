import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';
import { CourseQuestionAnswerOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question-answer.orm-entity';
import { CourseQuestionRepository } from '@/modules/course-questions/infrastructure/repository/course-question.repository';
import { COURSE_QUESTION_REPOSITORY } from '@/modules/course-questions/domain/repository/course-question.repository';

import { GetAdminQuestionsHandler } from '@/modules/course-questions/application/query-handler/get-admin-questions.handler';
import { GetAdminQuestionDetailHandler } from '@/modules/course-questions/application/query-handler/get-admin-question-detail.handler';
import { GetInstructorQuestionsHandler } from '@/modules/course-questions/application/query-handler/get-instructor-questions.handler';
import { GetCourseQuestionsHandler } from '@/modules/course-questions/application/query-handler/get-course-questions.handler';
import { UpdateQuestionStatusHandler } from '@/modules/course-questions/application/command-handler/update-question-status.handler';
import { UpdateAnswerStatusHandler } from '@/modules/course-questions/application/command-handler/update-answer-status.handler';
import { DeleteQuestionHandler } from '@/modules/course-questions/application/command-handler/delete-question.handler';
import { DeleteAnswerHandler } from '@/modules/course-questions/application/command-handler/delete-answer.handler';
import { AnswerQuestionHandler } from '@/modules/course-questions/application/command-handler/answer-question.handler';
import { CreateQuestionHandler } from '@/modules/course-questions/application/command-handler/create-question.handler';

import { AdminCourseQuestionsController } from '@/modules/course-questions/presentation/admin-course-questions.controller';
import { InstructorCourseQuestionsController } from '@/modules/course-questions/presentation/instructor-course-questions.controller';
import { StudentCourseQuestionsController } from '@/modules/course-questions/presentation/student-course-questions.controller';

const QueryHandlers = [
  GetAdminQuestionsHandler,
  GetAdminQuestionDetailHandler,
  GetInstructorQuestionsHandler,
  GetCourseQuestionsHandler,
];
const CommandHandlers = [
  UpdateQuestionStatusHandler,
  UpdateAnswerStatusHandler,
  DeleteQuestionHandler,
  DeleteAnswerHandler,
  AnswerQuestionHandler,
  CreateQuestionHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([CourseQuestionOrmEntity, CourseQuestionAnswerOrmEntity]),
  ],
  controllers: [
    AdminCourseQuestionsController,
    InstructorCourseQuestionsController,
    StudentCourseQuestionsController,
  ],
  providers: [
    CourseQuestionRepository,
    {
      provide: COURSE_QUESTION_REPOSITORY,
      useExisting: CourseQuestionRepository,
    },
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [COURSE_QUESTION_REPOSITORY],
})
export class CourseQuestionsModule {}

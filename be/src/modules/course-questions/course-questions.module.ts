import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';
import { CourseQuestionAnswerOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question-answer.orm-entity';
import { CourseQuestionRepository } from '@/modules/course-questions/infrastructure/repository/course-question.repository';
import { COURSE_QUESTION_REPOSITORY } from '@/modules/course-questions/domain/repository/course-question.repository';

import { GetAdminQuestionsHandler } from '@/modules/course-questions/application/query-handler/get-admin-questions.handler';
import { GetAdminQuestionDetailHandler } from '@/modules/course-questions/application/query-handler/get-admin-question-detail.handler';
import { UpdateQuestionStatusHandler } from '@/modules/course-questions/application/command-handler/update-question-status.handler';
import { UpdateAnswerStatusHandler } from '@/modules/course-questions/application/command-handler/update-answer-status.handler';
import { DeleteQuestionHandler } from '@/modules/course-questions/application/command-handler/delete-question.handler';
import { DeleteAnswerHandler } from '@/modules/course-questions/application/command-handler/delete-answer.handler';

import { AdminCourseQuestionsController } from '@/modules/course-questions/presentation/admin-course-questions.controller';

const QueryHandlers = [GetAdminQuestionsHandler, GetAdminQuestionDetailHandler];
const CommandHandlers = [
  UpdateQuestionStatusHandler,
  UpdateAnswerStatusHandler,
  DeleteQuestionHandler,
  DeleteAnswerHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([CourseQuestionOrmEntity, CourseQuestionAnswerOrmEntity]),
  ],
  controllers: [AdminCourseQuestionsController],
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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { ExamTypeOrmEntity } from './infrastructure/entity/exam-type.orm-entity';
import { ExamFormatOrmEntity } from './infrastructure/entity/exam-format.orm-entity';
import { ExamFormatSectionOrmEntity } from './infrastructure/entity/exam-format-section.orm-entity';
import { ExamQuestionTypeOrmEntity } from './infrastructure/entity/exam-question-type.orm-entity';
import { ExamOrmEntity } from './infrastructure/entity/exam.orm-entity';
import { ExamSectionOrmEntity } from './infrastructure/entity/exam-section.orm-entity';
import { ExamMaterialOrmEntity } from './infrastructure/entity/exam-material.orm-entity';
import { ExamQuestionOrmEntity } from './infrastructure/entity/exam-question.orm-entity';
import { ExamOptionOrmEntity } from './infrastructure/entity/exam-option.orm-entity';
import { ExamAttemptOrmEntity } from './infrastructure/entity/exam-attempt.orm-entity';
import { ExamAnswerOrmEntity } from './infrastructure/entity/exam-answer.orm-entity';

import { AdminExamTypeController } from './presentation/controllers/admin-exam-type.controller';
import { AdminExamFormatController } from './presentation/controllers/admin-exam-format.controller';
import { AdminExamQuestionTypeController } from './presentation/controllers/admin-exam-question-type.controller';
import { AdminExamController } from './presentation/controllers/admin-exam.controller';
import { AdminExamSectionController } from './presentation/controllers/admin-exam-section.controller';
import { AdminExamQuestionController } from './presentation/controllers/admin-exam-question.controller';
import { AdminExamMaterialController } from './presentation/controllers/admin-exam-material.controller';
import { StudentExamController } from './presentation/controllers/student-exam.controller';

import { CreateExamTypeHandler } from './application/command-handler/create-exam-type.handler';
import { UpdateExamTypeHandler } from './application/command-handler/update-exam-type.handler';
import { DeleteExamTypeHandler } from './application/command-handler/delete-exam-type.handler';
import { CreateExamFormatHandler } from './application/command-handler/create-exam-format.handler';
import { UpdateExamFormatHandler } from './application/command-handler/update-exam-format.handler';
import { DeleteExamFormatHandler } from './application/command-handler/delete-exam-format.handler';
import { CreateExamHandler } from './application/command-handler/create-exam.handler';
import { UpdateExamHandler } from './application/command-handler/update-exam.handler';
import { DeleteExamHandler } from './application/command-handler/delete-exam.handler';
import { PublishExamHandler } from './application/command-handler/publish-exam.handler';
import { ArchiveExamHandler } from './application/command-handler/archive-exam.handler';
import { CreateExamMaterialHandler } from './application/command-handler/create-exam-material.handler';
import { UpdateExamMaterialHandler } from './application/command-handler/update-exam-material.handler';
import { DeleteExamMaterialHandler } from './application/command-handler/delete-exam-material.handler';
import { CreateExamQuestionHandler } from './application/command-handler/create-exam-question.handler';
import { UpdateExamQuestionHandler } from './application/command-handler/update-exam-question.handler';
import { DeleteExamQuestionHandler } from './application/command-handler/delete-exam-question.handler';
import { StartExamAttemptHandler } from './application/command-handler/start-exam-attempt.handler';
import { SubmitExamAttemptHandler } from './application/command-handler/submit-exam-attempt.handler';

import { GetExamByIdHandler } from './application/query-handler/get-exam-by-id.handler';
import { GetExamListHandler } from './application/query-handler/get-exam-list.handler';
import { GetExamsByTypeHandler } from './application/query-handler/get-exams-by-type.handler';
import { GetExamDetailHandler } from './application/query-handler/get-exam-detail.handler';
import { GetPublishedExamsHandler } from './application/query-handler/get-published-exams.handler';
import { GetStudentExamDetailHandler } from './application/query-handler/get-student-exam-detail.handler';
import { GetExamSectionsHandler } from './application/query-handler/get-exam-sections.handler';
import { GetExamMaterialsHandler } from './application/query-handler/get-exam-materials.handler';
import { GetExamQuestionsHandler } from './application/query-handler/get-exam-questions.handler';
import { GetExamOptionsHandler } from './application/query-handler/get-exam-options.handler';
import { GetExamAttemptsHandler } from './application/query-handler/get-exam-attempts.handler';
import { GetExamAnswersHandler } from './application/query-handler/get-exam-answers.handler';

import { ExamTypeRepository } from './infrastructure/repository/exam-type.repository';
import { EXAM_TYPE_REPOSITORY } from './domain/repository/exam-type.repository';
import { ExamFormatRepository } from './infrastructure/repository/exam-format.repository';
import { EXAM_FORMAT_REPOSITORY } from './domain/repository/exam-format.repository';
import { ExamFormatSectionRepository } from './infrastructure/repository/exam-format-section.repository';
import { EXAM_FORMAT_SECTION_REPOSITORY } from './domain/repository/exam-format-section.repository';
import { ExamQuestionTypeRepository } from './infrastructure/repository/exam-question-type.repository';
import { EXAM_QUESTION_TYPE_REPOSITORY } from './domain/repository/exam-question-type.repository';
import { ExamRepository } from './infrastructure/repository/exam.repository';
import { EXAM_REPOSITORY } from './domain/repository/exam.repository';
import { ExamSectionRepository } from './infrastructure/repository/exam-section.repository';
import { EXAM_SECTION_REPOSITORY } from './domain/repository/exam-section.repository';
import { ExamMaterialRepository } from './infrastructure/repository/exam-material.repository';
import { EXAM_MATERIAL_REPOSITORY } from './domain/repository/exam-material.repository';
import { ExamQuestionRepository } from './infrastructure/repository/exam-question.repository';
import { EXAM_QUESTION_REPOSITORY } from './domain/repository/exam-question.repository';
import { ExamOptionRepository } from './infrastructure/repository/exam-option.repository';
import { EXAM_OPTION_REPOSITORY } from './domain/repository/exam-option.repository';
import { ExamAttemptRepository } from './infrastructure/repository/exam-attempt.repository';
import { EXAM_ATTEMPT_REPOSITORY } from './domain/repository/exam-attempt.repository';
import { ExamAnswerRepository } from './infrastructure/repository/exam-answer.repository';
import { EXAM_ANSWER_REPOSITORY } from './domain/repository/exam-answer.repository';

const ormEntities = [
  ExamTypeOrmEntity,
  ExamFormatOrmEntity,
  ExamFormatSectionOrmEntity,
  ExamQuestionTypeOrmEntity,
  ExamOrmEntity,
  ExamSectionOrmEntity,
  ExamMaterialOrmEntity,
  ExamQuestionOrmEntity,
  ExamOptionOrmEntity,
  ExamAttemptOrmEntity,
  ExamAnswerOrmEntity,
];

const commandHandlers = [
  CreateExamTypeHandler,
  UpdateExamTypeHandler,
  DeleteExamTypeHandler,
  CreateExamFormatHandler,
  UpdateExamFormatHandler,
  DeleteExamFormatHandler,
  CreateExamHandler,
  UpdateExamHandler,
  DeleteExamHandler,
  PublishExamHandler,
  ArchiveExamHandler,
  CreateExamMaterialHandler,
  UpdateExamMaterialHandler,
  DeleteExamMaterialHandler,
  CreateExamQuestionHandler,
  UpdateExamQuestionHandler,
  DeleteExamQuestionHandler,
  StartExamAttemptHandler,
  SubmitExamAttemptHandler,
];

const queryHandlers = [
  GetExamByIdHandler,
  GetExamListHandler,
  GetExamsByTypeHandler,
  GetExamDetailHandler,
  GetPublishedExamsHandler,
  GetStudentExamDetailHandler,
  GetExamSectionsHandler,
  GetExamMaterialsHandler,
  GetExamQuestionsHandler,
  GetExamOptionsHandler,
  GetExamAttemptsHandler,
  GetExamAnswersHandler,
];

const repositories = [
  { provide: EXAM_TYPE_REPOSITORY, useClass: ExamTypeRepository },
  { provide: EXAM_FORMAT_REPOSITORY, useClass: ExamFormatRepository },
  { provide: EXAM_FORMAT_SECTION_REPOSITORY, useClass: ExamFormatSectionRepository },
  { provide: EXAM_QUESTION_TYPE_REPOSITORY, useClass: ExamQuestionTypeRepository },
  { provide: EXAM_REPOSITORY, useClass: ExamRepository },
  { provide: EXAM_SECTION_REPOSITORY, useClass: ExamSectionRepository },
  { provide: EXAM_MATERIAL_REPOSITORY, useClass: ExamMaterialRepository },
  { provide: EXAM_QUESTION_REPOSITORY, useClass: ExamQuestionRepository },
  { provide: EXAM_OPTION_REPOSITORY, useClass: ExamOptionRepository },
  { provide: EXAM_ATTEMPT_REPOSITORY, useClass: ExamAttemptRepository },
  { provide: EXAM_ANSWER_REPOSITORY, useClass: ExamAnswerRepository },
];

@Module({
  imports: [TypeOrmModule.forFeature(ormEntities), CqrsModule],
  controllers: [
    AdminExamTypeController,
    AdminExamFormatController,
    AdminExamQuestionTypeController,
    AdminExamController,
    AdminExamSectionController,
    AdminExamQuestionController,
    AdminExamMaterialController,
    StudentExamController,
  ],
  providers: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class ExamsModule {}

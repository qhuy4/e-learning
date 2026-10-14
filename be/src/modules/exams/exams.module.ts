import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { StorageModule } from '@/common/storage/storage.module';

import { ExamTypeOrmEntity } from './infrastructure/entity/exam-type.orm-entity';
import { ExamFormatOrmEntity } from './infrastructure/entity/exam-format.orm-entity';
import { ExamFormatSectionOrmEntity } from './infrastructure/entity/exam-format-section.orm-entity';
import { ExamOrmEntity } from './infrastructure/entity/exam.orm-entity';
import { ExamSectionOrmEntity } from './infrastructure/entity/exam-section.orm-entity';
import { ExamGroupMaterialOrmEntity } from './infrastructure/entity/exam-group-material.orm-entity';
import { ExamQuestionOrmEntity } from './infrastructure/entity/exam-question.orm-entity';
import { ExamOptionOrmEntity } from './infrastructure/entity/exam-option.orm-entity';
import { ExamQuestionGroupOrmEntity } from './infrastructure/entity/exam-question-group.orm-entity';
import { ExamAttemptOrmEntity } from './infrastructure/entity/exam-attempt.orm-entity';
import { ExamAnswerOrmEntity } from './infrastructure/entity/exam-answer.orm-entity';

import { AdminExamTypeController } from './presentation/controllers/admin-exam-type.controller';
import { AdminExamFormatController } from './presentation/controllers/admin-exam-format.controller';
import { AdminExamController } from './presentation/controllers/admin-exam.controller';
import { AdminExamSectionController } from './presentation/controllers/admin-exam-section.controller';
import { AdminExamQuestionGroupController } from './presentation/controllers/admin-exam-question-group.controller';
import { AdminExamGroupMaterialController } from './presentation/controllers/admin-exam-group-material.controller';
import { StudentExamController } from './presentation/controllers/student-exam.controller';

import { GetExamDetailHandler } from './application/query-handler/get-exam-detail.handler';
import { GetStudentExamDetailHandler } from './application/query-handler/get-student-exam-detail.handler';

import { ExamTypeRepository } from './infrastructure/repository/exam-type.repository';
import { EXAM_TYPE_REPOSITORY } from './domain/repository/exam-type.repository';
import { ExamFormatRepository } from './infrastructure/repository/exam-format.repository';
import { EXAM_FORMAT_REPOSITORY } from './domain/repository/exam-format.repository';
import { ExamFormatSectionRepository } from './infrastructure/repository/exam-format-section.repository';
import { EXAM_FORMAT_SECTION_REPOSITORY } from './domain/repository/exam-format-section.repository';
import { ExamRepository } from './infrastructure/repository/exam.repository';
import { EXAM_REPOSITORY } from './domain/repository/exam.repository';
import { ExamSectionRepository } from './infrastructure/repository/exam-section.repository';
import { EXAM_SECTION_REPOSITORY } from './domain/repository/exam-section.repository';
import { ExamQuestionRepository } from './infrastructure/repository/exam-question.repository';
import { EXAM_QUESTION_REPOSITORY } from './domain/repository/exam-question.repository';
import { ExamOptionRepository } from './infrastructure/repository/exam-option.repository';
import { EXAM_OPTION_REPOSITORY } from './domain/repository/exam-option.repository';
import { ExamAttemptRepository } from './infrastructure/repository/exam-attempt.repository';
import { EXAM_ATTEMPT_REPOSITORY } from './domain/repository/exam-attempt.repository';
import { ExamAnswerRepository } from './infrastructure/repository/exam-answer.repository';
import { EXAM_ANSWER_REPOSITORY } from './domain/repository/exam-answer.repository';
import { ExamQuestionGroupRepository } from './infrastructure/repository/exam-question-group.repository';
import { EXAM_QUESTION_GROUP_REPOSITORY } from './domain/repository/exam-question-group.repository';
import { ExamGroupMaterialRepository } from './infrastructure/repository/exam-group-material.repository';
import { EXAM_GROUP_MATERIAL_REPOSITORY } from './domain/repository/exam-group-material.repository';

const ormEntities = [
  ExamTypeOrmEntity,
  ExamFormatOrmEntity,
  ExamFormatSectionOrmEntity,
  ExamOrmEntity,
  ExamSectionOrmEntity,
  ExamGroupMaterialOrmEntity,
  ExamQuestionOrmEntity,
  ExamOptionOrmEntity,
  ExamQuestionGroupOrmEntity,
  ExamAttemptOrmEntity,
  ExamAnswerOrmEntity,
];

const queryHandlers = [
  GetExamDetailHandler,
  GetStudentExamDetailHandler,
];

const repositories = [
  { provide: EXAM_TYPE_REPOSITORY, useClass: ExamTypeRepository },
  { provide: EXAM_FORMAT_REPOSITORY, useClass: ExamFormatRepository },
  { provide: EXAM_FORMAT_SECTION_REPOSITORY, useClass: ExamFormatSectionRepository },
  { provide: EXAM_REPOSITORY, useClass: ExamRepository },
  { provide: EXAM_SECTION_REPOSITORY, useClass: ExamSectionRepository },
  { provide: EXAM_QUESTION_REPOSITORY, useClass: ExamQuestionRepository },
  { provide: EXAM_OPTION_REPOSITORY, useClass: ExamOptionRepository },
  { provide: EXAM_ATTEMPT_REPOSITORY, useClass: ExamAttemptRepository },
  { provide: EXAM_ANSWER_REPOSITORY, useClass: ExamAnswerRepository },
  { provide: EXAM_QUESTION_GROUP_REPOSITORY, useClass: ExamQuestionGroupRepository },
  { provide: EXAM_GROUP_MATERIAL_REPOSITORY, useClass: ExamGroupMaterialRepository },
];

@Module({
  imports: [TypeOrmModule.forFeature(ormEntities), CqrsModule, StorageModule],
  controllers: [
    AdminExamTypeController,
    AdminExamFormatController,
    AdminExamController,
    AdminExamSectionController,
    AdminExamQuestionGroupController,
    AdminExamGroupMaterialController,
    StudentExamController,
  ],
  providers: [...queryHandlers, ...repositories],
  exports: [
    EXAM_TYPE_REPOSITORY,
    EXAM_FORMAT_REPOSITORY,
    EXAM_FORMAT_SECTION_REPOSITORY,
    EXAM_SECTION_REPOSITORY,
    EXAM_REPOSITORY,
    EXAM_QUESTION_REPOSITORY,
    EXAM_OPTION_REPOSITORY,
    EXAM_QUESTION_GROUP_REPOSITORY,
    EXAM_GROUP_MATERIAL_REPOSITORY,
  ],
})
export class ExamsModule {}

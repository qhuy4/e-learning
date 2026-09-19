import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { DictationOrmEntity } from './infrastructure/entity/dictation.orm-entity';
import { LessonDictationOrmEntity } from './infrastructure/entity/lesson-dictation.orm-entity';
import { DictationSentenceOrmEntity } from './infrastructure/entity/dictation-sentence.orm-entity';
import { DictationAttemptOrmEntity } from './infrastructure/entity/dictation-attempt.orm-entity';
import { DictationAnswerOrmEntity } from './infrastructure/entity/dictation-answer.orm-entity';

import { TeacherDictationController } from './presentation/controllers/teacher-dictation.controller';
import { StudentDictationController } from './presentation/controllers/student-dictation.controller';
import { AdminDictationController } from './presentation/controllers/admin-dictation.controller';

import { DictationRepository } from './infrastructure/repository/dictation.repository';
import { LessonDictationRepository } from './infrastructure/repository/lesson-dictation.repository';
import { DictationSentenceRepository } from './infrastructure/repository/dictation-sentence.repository';
import { DictationAttemptRepository } from './infrastructure/repository/dictation-attempt.repository';
import { DictationAnswerRepository } from './infrastructure/repository/dictation-answer.repository';

import { CreateDictationHandler } from './application/command-handler/create-dictation.handler';
import { UpdateDictationHandler } from './application/command-handler/update-dictation.handler';
import { DeleteDictationHandler } from './application/command-handler/delete-dictation.handler';
import { AttachDictationHandler } from './application/command-handler/attach-dictation.handler';
import { DetachDictationHandler } from './application/command-handler/detach-dictation.handler';
import { StartDictationHandler } from './application/command-handler/start-dictation.handler';
import { SubmitDictationHandler } from './application/command-handler/submit-dictation.handler';

import { GetDictationByIdHandler } from './application/query-handler/get-dictation-by-id.handler';
import { GetLessonDictationsHandler } from './application/query-handler/get-lesson-dictations.handler';
import { GetMyDictationsHandler } from './application/query-handler/get-my-dictations.handler';
import { GetAllDictationsHandler } from './application/query-handler/get-all-dictations.handler';

import { DICTATION_REPOSITORY } from './domain/repository/dictation.repository';
import { LESSON_DICTATION_REPOSITORY } from './domain/repository/lesson-dictation.repository';
import { DICTATION_SENTENCE_REPOSITORY } from './domain/repository/dictation-sentence.repository';
import { DICTATION_ATTEMPT_REPOSITORY } from './domain/repository/dictation-attempt.repository';
import { DICTATION_ANSWER_REPOSITORY } from './domain/repository/dictation-answer.repository';

import { StorageModule } from '@/common/storage/storage.module';

@Module({
  imports: [
    CqrsModule,
    StorageModule,
    TypeOrmModule.forFeature([
      DictationOrmEntity,
      LessonDictationOrmEntity,
      DictationSentenceOrmEntity,
      DictationAttemptOrmEntity,
      DictationAnswerOrmEntity
    ])
  ],
  controllers: [
    TeacherDictationController,
    StudentDictationController,
    AdminDictationController
  ],
  providers: [
    { provide: DICTATION_REPOSITORY, useClass: DictationRepository },
    { provide: LESSON_DICTATION_REPOSITORY, useClass: LessonDictationRepository },
    { provide: DICTATION_SENTENCE_REPOSITORY, useClass: DictationSentenceRepository },
    { provide: DICTATION_ATTEMPT_REPOSITORY, useClass: DictationAttemptRepository },
    { provide: DICTATION_ANSWER_REPOSITORY, useClass: DictationAnswerRepository },
    CreateDictationHandler,
    UpdateDictationHandler,
    DeleteDictationHandler,
    AttachDictationHandler,
    DetachDictationHandler,
    StartDictationHandler,
    SubmitDictationHandler,
    GetDictationByIdHandler,
    GetLessonDictationsHandler,
    GetMyDictationsHandler,
    GetAllDictationsHandler
  ]
})
export class DictationsModule {}

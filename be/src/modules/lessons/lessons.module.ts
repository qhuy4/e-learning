import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { LessonOrmEntity } from './infrastructure/entity/lesson.orm-entity';
import { LessonRepository } from './infrastructure/repository/lesson.repository';

import { LESSON_REPOSITORY } from './domain/repository/lesson.repository';

// Command handlers
import { CreateLessonHandler } from './application/command-handler/create-lesson.command.handler';
import { UpdateLessonHandler } from './application/command-handler/update-lesson.command.handler';
import { DeleteLessonHandler } from './application/command-handler/delete-lesson.command.handler';

import { LessonController } from './presentation/lesson.controller';

import { GetLessonByIdHandler } from './application/query-handler/get-lesson-by-id.handler';

const CommandHandlers = [
  CreateLessonHandler,
  UpdateLessonHandler,
  DeleteLessonHandler,
];

const QueryHandlers = [GetLessonByIdHandler];

import { SectionsModule } from '../sections/sections.module';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([LessonOrmEntity]),
    SectionsModule,
    StorageModule,
  ],

  controllers: [LessonController],

  providers: [
    LessonRepository,

    {
      provide: LESSON_REPOSITORY,
      useExisting: LessonRepository,
    },

    ...CommandHandlers,
    ...QueryHandlers,
  ],

  exports: [LESSON_REPOSITORY],
})
export class LessonsModule {}

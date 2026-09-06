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
import { LessonPublicController } from './presentation/lesson-public.controller';

import { GetLessonByIdHandler } from './application/query-handler/get-lesson-by-id.handler';
import { GetLessonBySlugHandler } from './application/query-handler/get-lesson-by-slug.handler';
import { PreviewLessonHandler } from './application/query-handler/preview-lesson.handler';

const CommandHandlers = [
  CreateLessonHandler,
  UpdateLessonHandler,
  DeleteLessonHandler,
];

const QueryHandlers = [
  GetLessonByIdHandler,
  GetLessonBySlugHandler,
  PreviewLessonHandler,
];

import { forwardRef } from '@nestjs/common';
import { SectionsModule } from '../sections/sections.module';
import { CoursesModule } from '../courses/courses.module';
import { StorageModule } from '../../common/storage/storage.module';
import { ServiceModule } from '@/common/service/service.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([LessonOrmEntity]),
    SectionsModule,
    forwardRef(() => CoursesModule),
    StorageModule,
    ServiceModule,
  ],

  controllers: [LessonController, LessonPublicController],

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

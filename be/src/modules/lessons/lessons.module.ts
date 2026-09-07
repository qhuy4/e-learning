import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { LessonRepository } from '@/modules/lessons/infrastructure/repository/lesson.repository';

import { LESSON_REPOSITORY } from '@/modules/lessons/domain/repository/lesson.repository';

// Command handlers
import { CreateLessonHandler } from '@/modules/lessons/application/command-handler/create-lesson.command.handler';
import { UpdateLessonHandler } from '@/modules/lessons/application/command-handler/update-lesson.command.handler';
import { DeleteLessonHandler } from '@/modules/lessons/application/command-handler/delete-lesson.command.handler';

import { LessonController } from '@/modules/lessons/presentation/lesson.controller';

import { GetLessonByIdHandler } from '@/modules/lessons/application/query-handler/get-lesson-by-id.handler';

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

import { SectionsModule } from '@/modules/sections/sections.module';
import { StorageModule } from '@/common/storage/storage.module';
import { GetLessonBySlugHandler } from '@/modules/lessons/application/query-handler/get-lesson-by-slug.handler';
import { PreviewLessonHandler } from '@/modules/lessons/application/query-handler/preview-lesson.handler';
import { ServiceModule } from '@/common/service/service.module';
import { CoursesModule } from '@/modules/courses/courses.module';
import { LessonPublicController } from '@/modules/lessons/presentation/lesson-public.controller';

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

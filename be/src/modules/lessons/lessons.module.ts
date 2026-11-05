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
import { InstructorLessonController } from '@/modules/lessons/presentation/instructor-lesson.controller';
import { InstructorLessonMaterialController } from '@/modules/lessons/presentation/instructor-lesson-material.controller';
import { LessonMaterialController } from '@/modules/lessons/presentation/lesson-material.controller';
import { LessonMaterialOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson-material.orm-entity';

import { GetLessonByIdHandler } from '@/modules/lessons/application/query-handler/get-lesson-by-id.handler';

import { SectionsModule } from '@/modules/sections/sections.module';
import { StorageModule } from '@/common/storage/storage.module';
import { GetLessonBySlugHandler } from '@/modules/lessons/application/query-handler/get-lesson-by-slug.handler';
import { PreviewLessonHandler } from '@/modules/lessons/application/query-handler/preview-lesson.handler';
import { ServiceModule } from '@/common/service/service.module';
import { CoursesModule } from '@/modules/courses/courses.module';
import { EnrollmentsModule } from '@/modules/enrollments/enrollments.module';
import { LessonPublicController } from '@/modules/lessons/presentation/lesson-public.controller';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { LessonProgressOrmEntity } from '@/modules/lesson-progress/infrastructure/entity/lesson-progress.orm-entity';
import { LessonAccessService } from '@/modules/lessons/application/service/lesson-access.service';

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

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      LessonOrmEntity,
      LessonMaterialOrmEntity,
      SectionOrmEntity,
      LessonProgressOrmEntity,
    ]),
    SectionsModule,
    forwardRef(() => CoursesModule),
    StorageModule,
    ServiceModule,
    EnrollmentsModule,
  ],

  controllers: [
    LessonController,
    LessonPublicController,
    InstructorLessonController,
    InstructorLessonMaterialController,
    LessonMaterialController,
  ],

  providers: [
    LessonRepository,

    {
      provide: LESSON_REPOSITORY,
      useExisting: LessonRepository,
    },

    ...CommandHandlers,
    ...QueryHandlers,
    LessonAccessService,
  ],

  exports: [LESSON_REPOSITORY, LessonAccessService],
})
export class LessonsModule {}

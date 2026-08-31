import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';

import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '../../common/storage/storage.module';

import { CourseOrmEntity } from './infrastructure/entity/course.orm-entity';

import { CourseRepository } from './infrastructure/repository/course.repository';

import { COURSE_REPOSITORY } from './domain/repository/course.repository';

import { CoursesController } from './presentation/courses.controller';

// Command handlers
import { CreateCourseHandler } from './application/command-handler/create-course.command.handler';
import { UpdateCourseHandler } from './application/command-handler/update-course.command.handler';
import { DeleteCourseHandler } from './application/command-handler/delete-course.command.handler';

// Query handlers
import { GetCoursesHandler } from './application/query-handler/get-courses.handler';

import { GetCourseBySlugHandler } from './application/query-handler/get-course-by-slug.handler';
import { GetCourseByIdHandler } from './application/query-handler/get-course-by-id.handler';

@Module({
  imports: [
    CqrsModule,

    StorageModule,

    TypeOrmModule.forFeature([CourseOrmEntity]),
  ],

  controllers: [CoursesController],

  providers: [
    CourseRepository,

    {
      provide: COURSE_REPOSITORY,

      useExisting: CourseRepository,
    },

    // Command handlers
    CreateCourseHandler,
    UpdateCourseHandler,
    DeleteCourseHandler,

    // Query handlers
    GetCoursesHandler,

    GetCourseBySlugHandler,
    GetCourseByIdHandler,
  ],
  exports: [COURSE_REPOSITORY],
})
export class CoursesModule {}

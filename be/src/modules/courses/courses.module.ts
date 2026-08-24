import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';

import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '../../common/storage/storage.module';

import { CourseOrmEntity } from './infrastructure/entity/course.orm-entity';

import { CourseRepository } from './infrastructure/repository/course.repository';

import { COURSE_REPOSITORY } from './domain/repository/course.repository';

import { CoursesController } from './presentation/courses.controller';

import { CreateCourseHandler } from './application/command-handler/create-course.command.handler';

// các handler query hiện tại
import { GetCoursesHandler } from './application/query-handler/get-courses.handler';

import { GetCourseBySlugHandler } from './application/query-handler/get-course-by-slug.handler';

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

    CreateCourseHandler,

    GetCoursesHandler,

    GetCourseBySlugHandler,
  ],
  exports: [COURSE_REPOSITORY],
})
export class CoursesModule {}

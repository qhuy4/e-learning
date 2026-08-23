import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseOrmEntity } from './domain/entity/course.orm-entity';
import { InstructorProfileOrmEntity } from '../instructors/domain/entity/instructor-profile.orm-entity';

import { CourseRepository } from './infrastructure/repository/course.repository';

import { CoursesController } from './presentation/courses.controller';

import { GetCoursesHandler } from './application/query-handler/get-courses.handler';

import { GetCourseByIdHandler } from './application/query-handler/get-course-by-id.handler';

import { GetCourseBySlugHandler } from './application/query-handler/get-course-by-slug.handler';
import { SectionOrmEntity } from './domain/entity/section.orm-entity';
import { LessonOrmEntity } from './domain/entity/lesson.orm-entity';
const queryHandlers = [
  GetCoursesHandler,
  GetCourseByIdHandler,
  GetCourseBySlugHandler,
];

@Module({
  imports: [
    CqrsModule,

    TypeOrmModule.forFeature([
      CourseOrmEntity,
      InstructorProfileOrmEntity,
      SectionOrmEntity,
      LessonOrmEntity,
    ]),
  ],

  controllers: [CoursesController],

  providers: [CourseRepository, ...queryHandlers],
})
export class CoursesModule {}

import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../../common/storage/storage.module';
import { CourseOrmEntity } from './infrastructure/entity/course.orm-entity';
import { CourseRepository } from './infrastructure/repository/course.repository';
import { COURSE_REPOSITORY } from './domain/repository/course.repository';
import { CoursesController } from './presentation/courses.controller';
import { InstructorCoursesController } from './presentation/instructor-courses.controller';

// Command handlers
import { CreateCourseHandler } from './application/command-handler/create-course.command.handler';
import { UpdateCourseHandler } from './application/command-handler/update-course.command.handler';
import { DeleteCourseHandler } from './application/command-handler/delete-course.command.handler';
import { GetCoursesHandler } from './application/query-handler/get-courses.handler';
import { GetInstructorCoursesHandler } from './application/query-handler/get-instructor-courses.handler';

import { GetAdminCoursesHandler } from './application/query-handler/get-admin-courses.handler';
import { GetCourseBySlugHandler } from './application/query-handler/get-course-by-slug.handler';
import { GetCourseByIdHandler } from './application/query-handler/get-course-by-id.handler';
import { CloneCourseHandler } from './application/command-handler/clone-course.handler';
import { ApproveCourseHandler } from './application/command-handler/approve-course.handler';
import { RejectCourseHandler } from './application/command-handler/reject-course.handler';
import { CancelReviewCourseHandler } from './application/command-handler/cancel-review-course.handler';
import { CreatePreviewTokenHandler } from './application/command-handler/create-preview-token.handler';
import { PreviewCourseQueryHandler } from './application/query-handler/preview-course-query.hanlder';
import { SectionsModule } from '../sections/sections.module';
import { LessonsModule } from '../lessons/lessons.module';
import { ServiceModule } from '@/common/service/service.module';

@Module({
  imports: [
    CqrsModule,
    StorageModule,
    TypeOrmModule.forFeature([CourseOrmEntity]),
    forwardRef(() => SectionsModule),
    LessonsModule,
    ServiceModule,
  ],

  controllers: [CoursesController, InstructorCoursesController],

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
    CloneCourseHandler,
    ApproveCourseHandler,
    RejectCourseHandler,
    CancelReviewCourseHandler,
    CreatePreviewTokenHandler,

    GetCoursesHandler,
    GetAdminCoursesHandler,
    GetInstructorCoursesHandler,

    GetCourseBySlugHandler,
    GetCourseByIdHandler,
    PreviewCourseQueryHandler,
  ],
  exports: [COURSE_REPOSITORY],
})
export class CoursesModule {}

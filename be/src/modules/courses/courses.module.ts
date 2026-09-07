import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '@/common/storage/storage.module';

import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';

import { CourseRepository } from '@/modules/courses/infrastructure/repository/course.repository';
import { AdminCourseRepository } from '@/modules/courses/infrastructure/repository/admin-course.repository';

import { COURSE_REPOSITORY } from '@/modules/courses/domain/repository/course.repository';

import { CoursesController } from '@/modules/courses/presentation/courses.controller';
import { InstructorCoursesController } from '@/modules/courses/presentation/instructor-courses.controller';
import { AdminCoursesController } from '@/modules/courses/presentation/admin-courses.controller';

// Command handlers
import { CreateCourseHandler } from '@/modules/courses/application/command-handler/create-course.command.handler';
import { UpdateCourseHandler } from '@/modules/courses/application/command-handler/update-course.command.handler';
import { DeleteCourseHandler } from '@/modules/courses/application/command-handler/delete-course.command.handler';
import { ReviewCourseHandler } from '@/modules/courses/application/command-handler/review-course.handler';
import { CloneCourseHandler } from '@/modules/courses/application/command-handler/clone-course.handler';

// Query handlers
import { GetCoursesHandler } from '@/modules/courses/application/query-handler/get-courses.handler';
import { GetInstructorCoursesHandler } from '@/modules/courses/application/query-handler/get-instructor-courses.handler';
import { GetAdminCoursesHandler } from '@/modules/courses/application/query-handler/get-admin-courses.handler';

import { GetCourseBySlugHandler } from '@/modules/courses/application/query-handler/get-course-by-slug.handler';
import { GetCourseByIdHandler } from '@/modules/courses/application/query-handler/get-course-by-id.handler';
import { SectionsModule } from '@/modules/sections/sections.module';
import { LessonsModule } from '@/modules/lessons/lessons.module';
import { ServiceModule } from '@/common/service/service.module';
import { ApproveCourseHandler } from '@/modules/courses/application/command-handler/approve-course.handler';
import { RejectCourseHandler } from '@/modules/courses/application/command-handler/reject-course.handler';
import { CancelReviewCourseHandler } from '@/modules/courses/application/command-handler/cancel-review-course.handler';
import { CreatePreviewTokenHandler } from '@/modules/courses/application/command-handler/create-preview-token.handler';
import { PreviewCourseQueryHandler } from '@/modules/courses/application/query-handler/preview-course-query.hanlder';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';

@Module({
  imports: [
    CqrsModule,

    StorageModule,
    TypeOrmModule.forFeature([
      CourseOrmEntity,
      UserOrmEntity,
      LessonOrmEntity,
      SectionOrmEntity,
    ]),
    forwardRef(() => SectionsModule),
    LessonsModule,
    ServiceModule,
  ],

  controllers: [
    CoursesController,
    InstructorCoursesController,
    AdminCoursesController,
  ],

  providers: [
    CourseRepository,
    AdminCourseRepository,

    {
      provide: COURSE_REPOSITORY,

      useExisting: CourseRepository,
    },

    // Command handlers
    CreateCourseHandler,
    UpdateCourseHandler,
    DeleteCourseHandler,
    CloneCourseHandler,
    ReviewCourseHandler,
    ApproveCourseHandler,
    RejectCourseHandler,
    CancelReviewCourseHandler,
    CreatePreviewTokenHandler,

    // Query handlers
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
